import type { Metadata } from "next";
import Avatar from "@/components/Avatar";
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/initials";
import { signOut } from "@/app/actions";

export const metadata: Metadata = { title: "Me · Teamingful" };

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, title, organization, orcid")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl">Me</h1>

      <section>
        <h2 className="mb-2 text-lg">How others see you</h2>
        <div className="card flex items-center gap-4 p-4">
          <Avatar text={initials(profile?.full_name || user!.email)} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium">{profile?.full_name || "Your name"}</p>
            {profile?.title && <p className="truncate text-sm">{profile.title}</p>}
            {profile?.organization && (
              <p className="truncate text-sm text-muted">{profile.organization}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          This is what people see when you share a team with them.
        </p>
      </section>

      <ProfileForm profile={profile} />

      <div className="space-y-1">
        <p className="text-sm text-muted">Signed in as {user!.email}</p>
        <form action={signOut}>
          <button className="min-h-[44px] text-muted underline hover:text-ink">Sign out</button>
        </form>
      </div>
    </div>
  );
}
