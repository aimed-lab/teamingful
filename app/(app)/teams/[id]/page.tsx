import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PromisePill from "@/components/PromisePill";
import TeamMark from "@/components/TeamMark";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/initials";
import { getLocalToday } from "@/lib/localToday";
import { formatDay, formatDue } from "@/lib/dueDate";
import { togglePromise } from "../actions";

export const metadata: Metadata = { title: "Team · Teamingful" };

type Person = { full_name: string; organization: string | null };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: team }, { data: profile }] = await Promise.all([
    supabase
      .from("teams")
      .select(
        "id, name, summary, met_on, met_at, events(name), team_people(people(full_name, organization)), promises(id, text, owed_by, due_on, done, created_at), captures(photo_paths, audio_path)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
  ]);
  if (!team) notFound();

  const them = (team.team_people as unknown as { people: Person | null }[])[0]?.people ?? null;
  const theirName = them?.full_name ?? team.name;
  const theirFirst = theirName.split(/\s+/)[0];
  const myName = profile?.full_name?.trim() || "";
  const myFirst = myName.split(/\s+/)[0] || "You";
  const today = await getLocalToday();

  const event = (team.events as unknown as { name: string } | null)?.name ?? team.met_at;
  const metLine = [event ? `Met at ${event}` : "Met", team.met_on ? formatDay(team.met_on, today) : null]
    .filter(Boolean)
    .join(", ");

  const promises = [...(team.promises as { id: string; text: string; owed_by: string; due_on: string | null; done: boolean; created_at: string }[])].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.due_on ?? "9999").localeCompare(b.due_on ?? "9999") ||
      a.created_at.localeCompare(b.created_at)
  );

  // Photos and voice notes from the captures that made this team
  const captures = team.captures as { photo_paths: string[] | null; audio_path: string | null }[];
  const photoPaths = captures.flatMap((c) => c.photo_paths ?? []);
  const audioPaths = captures.flatMap((c) => (c.audio_path ? [c.audio_path] : []));
  const [photos, audios] = await Promise.all([
    photoPaths.length ? supabase.storage.from("captures").createSignedUrls(photoPaths, 3600) : null,
    audioPaths.length ? supabase.storage.from("captures").createSignedUrls(audioPaths, 3600) : null,
  ]);
  const photoUrls = (photos?.data ?? []).map((p) => p.signedUrl).filter(Boolean) as string[];
  const audioUrls = (audios?.data ?? []).map((p) => p.signedUrl).filter(Boolean) as string[];

  return (
    <div className="space-y-4 lg:max-w-[640px]">
      <header className="flex items-center gap-4">
        <TeamMark size="lg" me={initials(myName || user!.email)} them={initials(theirName)} />
        <div className="min-w-0">
          <h1 className="font-heading text-[28px] font-extrabold leading-tight tracking-[-0.03em]">
            {myFirst} and {theirFirst}
          </h1>
          <p className="text-muted">{metLine}</p>
          {them?.organization && <p className="truncate text-muted">{them.organization}</p>}
        </div>
      </header>

      <section className="card p-4">
        <h2 className="text-lg">Promises</h2>
        {promises.length === 0 ? (
          <p className="mt-2 text-muted">No promises yet.</p>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {promises.map((p) => {
              const due = formatDue(p.due_on, today);
              return (
                <li key={p.id}>
                  <form action={togglePromise.bind(null, p.id, team.id, !p.done)}>
                    <button
                      aria-label={p.done ? `Mark not done: ${p.text}` : `Mark done: ${p.text}`}
                      className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs text-white ${
                          p.done ? "border-team bg-team" : "border-line"
                        }`}
                        aria-hidden="true"
                      >
                        {p.done ? "✓" : ""}
                      </span>
                      <span className={`min-w-0 flex-1 ${p.done ? "text-muted line-through" : ""}`}>{p.text}</span>
                      <PromisePill who={p.done ? "shared" : p.owed_by === "owner" ? "me" : "them"}>
                        <span className="whitespace-nowrap">
                          {p.owed_by === "owner" ? "you" : theirFirst}
                          {due ? `, ${due}` : ""}
                        </span>
                      </PromisePill>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {team.summary && (
        <section className="card p-4">
          <h2 className="text-lg">What you said</h2>
          <p className="mt-2">{team.summary}</p>
        </section>
      )}

      {(photoUrls.length > 0 || audioUrls.length > 0) && (
        <section className="card space-y-3 p-4">
          <h2 className="text-lg">Captures</h2>
          {photoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photoUrls.map((u, i) => (
                <a key={u} href={u} target="_blank" rel="noreferrer" aria-label={`Open photo ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-xl object-cover" />
                </a>
              ))}
            </div>
          )}
          {audioUrls.map((u) => (
            <audio key={u} controls src={u} className="w-full" />
          ))}
        </section>
      )}

      <div>
        <button
          disabled
          className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-full bg-line px-5 font-medium text-muted"
        >
          Share with {theirFirst}
        </button>
        <p className="mt-2 text-sm text-muted">Sharing comes next.</p>
      </div>
    </div>
  );
}
