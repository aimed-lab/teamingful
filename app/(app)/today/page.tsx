import Link from "next/link";
import TeamMark from "@/components/TeamMark";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/initials";
import type { Metadata } from "next";
import Greeting from "@/components/Greeting";
import FirstVisit from "@/components/FirstVisit";
import { ConferenceCard, FinishProfileCard } from "@/components/SideCards";
import { getLocalToday } from "@/lib/localToday";
import { partOfDay } from "@/lib/partOfDay";
import EventForm from "@/components/EventForm";
import { endEvent } from "@/app/actions";

export const metadata: Metadata = { title: "Today · Teamingful" };

type TeamRow = {
  id: string;
  name: string;
  summary: string | null;
  met_on: string | null;
  team_people: { people: { full_name: string; organization: string | null } | null }[];
};

function dayOfEvent(startsOn: string | null, endsOn: string | null) {
  if (!startsOn) return null;
  const day = 86400000;
  const start = new Date(startsOn).getTime();
  const n = Math.max(Math.floor((Date.now() - start) / day) + 1, 1);
  if (!endsOn) return `day ${n}`;
  const total = Math.round((new Date(endsOn).getTime() - start) / day) + 1;
  return `day ${Math.min(n, total)} of ${total}`;
}

function TeamRowItem({ team, me }: { team: TeamRow; me: string }) {
  const first = team.team_people[0]?.people;
  const grayLine = first?.organization || team.summary || "";
  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex min-h-[44px] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
    >
      <TeamMark
        me={me}
        them={initials(first?.full_name ?? team.name)}
        count={team.team_people.length + 1}
      />
      <div className="min-w-0">
        <p className="truncate font-medium">{team.name}</p>
        {grayLine && <p className="truncate text-sm text-muted">{grayLine}</p>}
      </div>
    </Link>
  );
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getLocalToday();
  const weekEnd = await getLocalToday(7);

  const [{ data: profile }, { data: event }, { data: promises }, { data: teams }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, title, organization").eq("id", user!.id).maybeSingle(),
      supabase.from("events").select("*").eq("is_active", true).maybeSingle(),
      supabase
        .from("promises")
        .select("text")
        .eq("owed_by", "owner")
        .eq("done", false)
        .gte("due_on", today)
        .lte("due_on", weekEnd)
        .order("due_on"),
      supabase
        .from("teams")
        .select("id, name, summary, met_on, team_people(people(full_name, organization))")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || null;
  const me = initials(profile?.full_name ?? user!.email);
  const allTeams = (teams ?? []) as unknown as TeamRow[];
  const todayTeams = allTeams.filter((t) => t.met_on === today);
  const earlier = allTeams.filter((t) => t.met_on !== today).slice(0, 10);

  const profileIncomplete = !profile?.title?.trim() || !profile?.organization?.trim();

  return (
    <div className="xl:grid xl:grid-cols-[640px_300px] xl:items-start xl:gap-10">
      <div className="min-w-0 space-y-5">
      {event ? (
        <div className="flex items-center justify-between gap-3 rounded-card bg-ink p-4 text-white">
          <div>
            <p className="font-heading text-lg font-bold">You&apos;re at {event.name}</p>
            <p className="text-sm text-white/80">
              {[event.location, dayOfEvent(event.starts_on, event.ends_on)]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          <form action={endEvent}>
            <button className="min-h-[44px] rounded-full bg-white/15 px-5 font-medium hover:bg-white/25">
              End
            </button>
          </form>
        </div>
      ) : null}

      <Greeting
        firstName={firstName}
        initialPart={partOfDay(new Date().getUTCHours())}
        subtitle={allTeams.length === 0 ? "Here is how your first team will happen." : undefined}
      />

      {!event && allTeams.length > 0 && <EventForm />}

      {(promises ?? []).length > 0 && (
        <div className="rounded-card bg-them-light p-4">
          <p className="font-medium text-them-text">
            {promises!.length} promises this week
          </p>
          <p className="mt-1 text-sm text-ink">{promises![0].text}</p>
        </div>
      )}

      {allTeams.length === 0 ? (
        <FirstVisit />
      ) : (
        <>
          {todayTeams.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg">Today</h2>
              <div className="card overflow-hidden">
                {todayTeams.map((t) => (
                  <TeamRowItem key={t.id} team={t} me={me} />
                ))}
              </div>
            </section>
          )}
          {earlier.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg">Earlier</h2>
              <div className="card overflow-hidden">
                {earlier.map((t) => (
                  <TeamRowItem key={t.id} team={t} me={me} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
      </div>

      {(profileIncomplete || !event) && (
        <aside className="mt-5 space-y-5 xl:mt-0">
          {profileIncomplete && <FinishProfileCard initials={me} />}
          {!event && <ConferenceCard />}
        </aside>
      )}
    </div>
  );
}
