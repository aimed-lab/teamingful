import Link from "next/link";
import Avatar from "./Avatar";
import StartEventButton from "./StartEventButton";

// Cards for the right column of Today (under the content on phone).

export function FinishProfileCard({ initials }: { initials: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <Avatar text={initials} size="lg" />
        <div>
          <h2 className="text-lg">Finish your profile</h2>
          <p className="text-sm text-muted">People see this when you share a team.</p>
        </div>
      </div>
      <Link href="/me" className="btn mt-4 w-full">
        Add details
      </Link>
    </div>
  );
}

export function ConferenceCard() {
  return (
    <div className="rounded-card bg-ink p-5 text-white">
      <h2 className="text-lg">Going to a conference?</h2>
      <p className="mt-1 text-sm text-white/70">
        Turn on event mode and everyone you meet is tagged with it.
      </p>
      <div className="mt-4 flex flex-col">
        <StartEventButton label="Start event mode" variant="white" />
      </div>
    </div>
  );
}
