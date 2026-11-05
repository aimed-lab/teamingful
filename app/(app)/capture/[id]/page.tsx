import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CaptureProgress from "@/components/capture/CaptureProgress";
import ConfirmForm from "@/components/capture/ConfirmForm";
import type { StoredExtract } from "@/lib/capture/extract";

export const metadata: Metadata = { title: "Confirm · Teamingful" };

export default async function ConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: capture } = await supabase
    .from("captures")
    .select("id, kind, team_id, status, error, ai_extract, photo_paths, audio_path, text_content")
    .eq("id", id)
    .maybeSingle();
  if (!capture) notFound();
  if (capture.team_id) redirect(`/teams/${capture.team_id}`);

  const photoPaths: string[] = capture.photo_paths ?? [];

  if (capture.status !== "ready" || !capture.ai_extract) {
    return (
      <CaptureProgress
        id={id}
        status={capture.status === "failed" ? "failed" : "reading"}
        error={capture.error}
        hasPhotos={photoPaths.length > 0}
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: profile }, { data: event }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
    supabase.from("events").select("name").eq("is_active", true).maybeSingle(),
  ]);

  const [photos, audio] = await Promise.all([
    photoPaths.length ? supabase.storage.from("captures").createSignedUrls(photoPaths, 3600) : null,
    capture.audio_path ? supabase.storage.from("captures").createSignedUrl(capture.audio_path, 3600) : null,
  ]);

  return (
    <ConfirmForm
      captureId={id}
      kind={capture.kind}
      extract={capture.ai_extract as StoredExtract}
      myFirstName={profile?.full_name?.trim().split(/\s+/)[0] || "You"}
      eventName={event?.name ?? null}
      photoUrls={(photos?.data ?? []).map((p) => p.signedUrl).filter(Boolean) as string[]}
      audioUrl={audio?.data?.signedUrl ?? null}
    />
  );
}
