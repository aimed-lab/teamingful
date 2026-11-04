import { createClient } from "@/lib/supabase/server";
import { saveProfile, signOut } from "@/app/actions";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, title, organization")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Me</h1>
        <p className="mt-2 text-muted">Your details, shown to the people you team up with.</p>
      </div>

      <p className="text-sm text-muted">Signed in as {user!.email}</p>

      <form action={saveProfile} className="card space-y-3 p-4">
        <label className="block text-sm text-muted">
          Full name
          <input name="full_name" defaultValue={profile?.full_name ?? ""} className="input mt-1" />
        </label>
        <label className="block text-sm text-muted">
          Title
          <input name="title" defaultValue={profile?.title ?? ""} className="input mt-1" />
        </label>
        <label className="block text-sm text-muted">
          Organization
          <input
            name="organization"
            defaultValue={profile?.organization ?? ""}
            className="input mt-1"
          />
        </label>
        <button className="btn w-full">Save</button>
      </form>

      <form action={signOut}>
        <button className="btn-outline w-full">Sign out</button>
      </form>
    </div>
  );
}
