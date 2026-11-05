import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readWithAi } from "@/lib/capture/openrouter";
import { getLocalToday } from "@/lib/localToday";
import { resolveDue } from "@/lib/dueDate";
import type { StoredExtract } from "@/lib/capture/extract";

// Reads one capture with AI. Safe to call again: "Try again" just calls this again.
export const maxDuration = 60;

const AUDIO_FORMATS: Record<string, string> = { webm: "webm", m4a: "m4a", mp4: "m4a", ogg: "ogg", wav: "wav", mp3: "mp3" };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  let localDate = await getLocalToday();
  try {
    const body = await request.json();
    if (typeof body?.localDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.localDate)) {
      localDate = body.localDate;
    }
  } catch {
    // no body is fine
  }

  const { data: capture } = await supabase
    .from("captures")
    .select("id, kind, text_content, photo_paths, audio_path")
    .eq("id", id)
    .maybeSingle();
  if (!capture) return NextResponse.json({ ok: false, error: "Capture not found." }, { status: 404 });

  const fail = async (message: string, status = 502) => {
    await supabase.from("captures").update({ status: "failed", error: message }).eq("id", id);
    return NextResponse.json({ ok: false, error: message }, { status });
  };

  await supabase.from("captures").update({ status: "reading", error: null }).eq("id", id);

  try {
    const photoPaths: string[] = capture.photo_paths ?? [];
    if (photoPaths.length === 0 && !capture.audio_path && !capture.text_content?.trim()) {
      return await fail("Nothing to read yet. Add a photo, a voice note or a note.", 400);
    }

    const images = await Promise.all(
      photoPaths.map(async (path) => {
        const { data, error } = await supabase.storage.from("captures").download(path);
        if (error || !data) throw new Error("download");
        return { mime: "image/jpeg", b64: Buffer.from(await data.arrayBuffer()).toString("base64") };
      })
    );

    let audio: { b64: string; format: string } | null = null;
    if (capture.audio_path) {
      const { data, error } = await supabase.storage.from("captures").download(capture.audio_path);
      if (error || !data) throw new Error("download");
      const ext = capture.audio_path.split(".").pop() ?? "webm";
      audio = {
        b64: Buffer.from(await data.arrayBuffer()).toString("base64"),
        format: AUDIO_FORMATS[ext] ?? ext,
      };
    }

    const [{ data: profile }, { data: event }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("events").select("name").eq("is_active", true).maybeSingle(),
    ]);

    const { extract, usage } = await readWithAi({
      images,
      audio,
      note: capture.text_content?.trim() || null,
      mode: capture.kind,
      today: localDate,
      userName: profile?.full_name ?? null,
      eventName: event?.name ?? null,
    });

    const stored: StoredExtract = {
      ...extract,
      local_date: localDate,
      promises: extract.promises.map((p) => ({ ...p, due_on: resolveDue(p.due_hint, localDate) })),
    };

    const { error } = await supabase
      .from("captures")
      .update({ ai_extract: stored, usage, status: "ready", error: null })
      .eq("id", id);
    if (error) throw new Error("save");

    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    console.error("Capture read failed", id, code);
    if (code === "not_configured") return await fail("Reading is not set up yet. Ask the app owner to add the AI key.");
    if (code === "http_402") return await fail("Reading is paused because the AI credit ran out. Ask the app owner to top it up.");
    if (code === "http_401") return await fail("Reading is not set up right. Ask the app owner to check the AI key.");
    if (code === "download") return await fail("We could not open your files. Try again.");
    return await fail("The reading took too long or failed. Your files are safe. Try again.");
  }
}
