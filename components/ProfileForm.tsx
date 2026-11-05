"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions";

type Profile = {
  full_name: string | null;
  title: string | null;
  organization: string | null;
  orcid: string | null;
};

// The editable details on the Me screen, with a small "Saved" note.
export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState(saveProfile, null);

  return (
    <form action={action} className="card space-y-3 p-4">
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
      <label className="block text-sm text-muted">
        ORCID iD (optional)
        <input
          name="orcid"
          defaultValue={profile?.orcid ?? ""}
          placeholder="0000-0002-1825-0097"
          className="input mt-1"
        />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn disabled:opacity-60">
          {pending ? "Saving..." : "Save"}
        </button>
        {state?.saved && !pending && <span className="text-sm text-team-text">Saved</span>}
      </div>
    </form>
  );
}
