import AppFrame from "@/components/AppFrame";
import { createClient } from "@/lib/supabase/server";

// Layout for every signed-in page. Loads the active event for the sidebar card.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("is_active", true)
    .maybeSingle();

  let activeEvent = null;
  if (event) {
    const { data: teams } = await supabase
      .from("teams")
      .select("id, team_people(person_id)")
      .eq("event_id", event.id);
    const teamIds = (teams ?? []).map((t) => t.id);
    const people = (teams ?? []).reduce((n, t) => n + t.team_people.length, 0);

    let promises = 0;
    if (teamIds.length > 0) {
      const { count } = await supabase
        .from("promises")
        .select("id", { count: "exact", head: true })
        .in("team_id", teamIds);
      promises = count ?? 0;
    }
    activeEvent = { name: event.name, people, promises };
  }

  return <AppFrame activeEvent={activeEvent}>{children}</AppFrame>;
}
