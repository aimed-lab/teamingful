import AppFrame from "@/components/AppFrame";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/initials";

// Layout for every signed-in page. Loads the user and the active event for the sidebar.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: event }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, title, organization")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase.from("events").select("id, name").eq("is_active", true).maybeSingle(),
  ]);

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

  const name = profile?.full_name?.trim();
  const frameUser = {
    initials: initials(name || user!.email),
    firstName: name ? name.split(/\s+/)[0] : (user!.email ?? "Me").split("@")[0],
    organization: profile?.organization ?? null,
    profileComplete: Boolean(profile?.title?.trim() && profile?.organization?.trim()),
  };

  return (
    <AppFrame activeEvent={activeEvent} user={frameUser}>
      {children}
    </AppFrame>
  );
}
