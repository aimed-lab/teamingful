"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const KINDS = ["card", "badge", "slide", "poster", "voice", "note"] as const;

// Step 1 of reading: make the capture row (status 'reading'). Files are uploaded after this.
export async function createCapture(input: { kind: string; note: string | null }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const kind = (KINDS as readonly string[]).includes(input.kind) ? input.kind : "note";
  const { data, error } = await supabase
    .from("captures")
    .insert({
      owner_id: user.id,
      kind,
      text_content: input.note?.trim() || null,
      status: "reading",
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("createCapture", error?.message);
    return { error: "We could not start your capture. Check your connection and try again." };
  }
  return { id: data.id as string, userId: user.id };
}

// Remove a capture and its files.
export async function discardCapture(captureId: string) {
  const supabase = await createClient();
  const { data: capture } = await supabase
    .from("captures")
    .select("photo_paths, audio_path")
    .eq("id", captureId)
    .maybeSingle();
  if (capture) {
    const paths = [...(capture.photo_paths ?? []), ...(capture.audio_path ? [capture.audio_path] : [])];
    if (paths.length) await supabase.storage.from("captures").remove(paths);
    await supabase.from("captures").delete().eq("id", captureId);
  }
  revalidatePath("/today");
  redirect("/today");
}

const nullable = z.string().trim().transform((v) => v || null);

const MakeTeamSchema = z.object({
  captureId: z.string().uuid(),
  person: z.object({
    full_name: z.string().trim().min(1, "Add their name first."),
    title: nullable,
    organization: nullable,
    email: nullable,
    phone: nullable,
    orcid: nullable,
    linkedin_url: nullable,
  }),
  teamName: z.string().trim().optional(),
  said: z.string().trim(),
  metAt: z.string().trim(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  promises: z.array(
    z.object({
      text: z.string().trim().min(1),
      owed_by: z.enum(["owner", "other"]),
      due_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    })
  ),
});

// Escape % and _ so ilike matches the text exactly (case-insensitive).
const exact = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

// Make our team: person -> team -> team_people -> promises -> link the capture.
// If any step fails, what was made is removed and an error is returned.
export async function makeTeam(raw: unknown): Promise<{ error: string }> {
  const parsed = MakeTeamSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Something is missing." };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: capture } = await supabase
    .from("captures")
    .select("id, team_id")
    .eq("id", d.captureId)
    .maybeSingle();
  if (!capture) return { error: "That capture no longer exists." };
  if (capture.team_id) redirect(`/teams/${capture.team_id}`);

  let personId: string | null = null;
  let createdPerson = false;
  let teamId: string | null = null;

  const cleanup = async () => {
    if (teamId) await supabase.from("teams").delete().eq("id", teamId); // cascades team_people, promises
    if (createdPerson && personId) await supabase.from("people").delete().eq("id", personId);
  };

  try {
    // 1. Reuse a person: same email, or same name + organization.
    if (d.person.email) {
      const { data } = await supabase
        .from("people")
        .select("id")
        .ilike("email", exact(d.person.email))
        .limit(1)
        .maybeSingle();
      personId = data?.id ?? null;
    }
    if (!personId) {
      let q = supabase.from("people").select("id").ilike("full_name", exact(d.person.full_name));
      q = d.person.organization ? q.ilike("organization", exact(d.person.organization)) : q.is("organization", null);
      const { data } = await q.limit(1).maybeSingle();
      personId = data?.id ?? null;
    }
    if (!personId) {
      const { data, error } = await supabase
        .from("people")
        .insert({ owner_id: user.id, ...d.person })
        .select("id")
        .single();
      if (error || !data) throw new Error("person");
      personId = data.id;
      createdPerson = true;
    }

    // 2. The team
    const { data: event } = await supabase.from("events").select("id, name").eq("is_active", true).maybeSingle();
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        owner_id: user.id,
        name: d.teamName || d.person.full_name,
        event_id: event?.id ?? null,
        met_on: d.localDate,
        met_at: d.metAt || null,
        summary: d.said || null,
      })
      .select("id")
      .single();
    if (teamError || !team) throw new Error("team");
    teamId = team.id;

    // 3. People and promises
    const { error: linkError } = await supabase
      .from("team_people")
      .insert({ team_id: teamId, person_id: personId });
    if (linkError) throw new Error("link");

    if (d.promises.length) {
      const { error: promiseError } = await supabase.from("promises").insert(
        d.promises.map((p) => ({ team_id: teamId, created_by: user.id, ...p }))
      );
      if (promiseError) throw new Error("promises");
    }

    // 4. Tie the capture to the team
    const { error: capError } = await supabase.from("captures").update({ team_id: teamId }).eq("id", d.captureId);
    if (capError) throw new Error("capture");
  } catch (e) {
    console.error("makeTeam failed at", e instanceof Error ? e.message : e);
    await cleanup();
    return { error: "We could not make the team. Nothing was saved. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/teams/${teamId}`);
}
