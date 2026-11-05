import Link from "next/link";
import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { TeamsIcon } from "@/components/Icons";
import TeamMark from "@/components/TeamMark";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/initials";
import { getLocalToday } from "@/lib/localToday";
import { formatDay } from "@/lib/dueDate";

export const metadata: Metadata = { title: "Teams · Teamingful" };

type Row = {
  id: string;
  name: string;
  met_on: string | null;
  team_people: { people: { full_name: string; organization: string | null } | null }[];
  promises: { owed_by: string; done: boolean }[];
};

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data }, { data: profile }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, met_on, team_people(people(full_name, organization)), promises(owed_by, done)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
  ]);
  const teams = (data ?? []) as unknown as Row[];

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={<TeamsIcon />}
        title="Your teams will live here"
        text="Every person you capture becomes a team of two, with what each of you promised."
        action={{ label: "Capture someone", href: "/capture" }}
      />
    );
  }

  const me = initials(profile?.full_name ?? user!.email);
  const today = await getLocalToday();

  return (
    <div className="space-y-4 lg:max-w-[640px]">
      <h1 className="font-heading text-[28px] font-extrabold tracking-[-0.03em]">Teams</h1>
      <div className="card overflow-hidden">
        {teams.map((t) => {
          const them = t.team_people[0]?.people;
          const open = t.promises.some((p) => p.owed_by === "owner" && !p.done);
          const sub = [them?.organization, t.met_on ? formatDay(t.met_on, today) : null].filter(Boolean).join(" · ");
          return (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="flex min-h-[64px] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-paper"
            >
              <TeamMark me={me} them={initials(them?.full_name ?? t.name)} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.name}</p>
                {sub && <p className="truncate text-sm text-muted">{sub}</p>}
              </div>
              {open && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-them"
                  role="img"
                  aria-label="You have an open promise"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
