import Link from "next/link";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { CameraIcon } from "./Icons";
import { BottomBar, SidebarLinks } from "./NavLinks";

export type ActiveEventSummary = {
  name: string;
  people: number;
  promises: number;
};

export type FrameUser = {
  initials: string;
  firstName: string;
  organization: string | null;
  profileComplete: boolean; // has both title and organization
};

// The frame around every signed-in page.
// Phone: content column + bottom bar. Laptop (lg): left sidebar, no bottom bar.
export default function AppFrame({
  activeEvent,
  user,
  children,
}: {
  activeEvent: ActiveEventSummary | null;
  user: FrameUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Laptop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-col border-r border-line bg-white p-4 lg:flex">
        <Logo href="/today" />
        <Link href="/capture" className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-you px-5 font-medium text-white hover:bg-you/90">
          <CameraIcon size={20} />
          Capture
        </Link>
        <SidebarLinks />

        <div className="mt-auto space-y-3">
          {activeEvent && (
            <div className="rounded-card bg-team-light p-3">
              <p className="text-sm font-medium text-team-text">{activeEvent.name}</p>
              <p className="mt-1 text-sm text-muted">
                {activeEvent.people} people, {activeEvent.promises} promises
              </p>
            </div>
          )}
          <Link
            href="/me"
            className="flex min-h-[44px] items-center gap-3 rounded-xl p-2 hover:bg-paper"
          >
            <Avatar text={user.initials} />
            <span className="min-w-0">
              <span className="block truncate font-medium">{user.firstName}</span>
              <span className="block truncate text-sm text-muted">
                {user.profileComplete ? user.organization : "Add your details"}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Page content */}
      <main className="mx-auto max-w-[480px] px-4 pb-28 pt-6 lg:ml-[220px] lg:mr-0 lg:max-w-[880px] xl:max-w-[1060px] lg:px-10 lg:pb-10">
        {children}
      </main>

      <BottomBar />
    </div>
  );
}
