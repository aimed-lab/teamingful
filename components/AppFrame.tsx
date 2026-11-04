import Link from "next/link";
import { BottomBar, SidebarLinks } from "./NavLinks";

export type ActiveEventSummary = {
  name: string;
  people: number;
  promises: number;
};

// The frame around every signed-in page.
// Phone: content column + bottom bar. Laptop (lg): left sidebar, no bottom bar.
export default function AppFrame({
  activeEvent,
  children,
}: {
  activeEvent: ActiveEventSummary | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Laptop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-col border-r border-line bg-white p-4 lg:flex">
        <span className="font-heading text-2xl font-bold text-green">Teamingful</span>
        <Link href="/capture" className="btn mt-5">
          Capture
        </Link>
        <SidebarLinks />

        {activeEvent && (
          <div className="mt-auto rounded-card bg-green-light p-3">
            <p className="text-sm font-medium text-green">{activeEvent.name}</p>
            <p className="mt-1 text-sm text-muted">
              {activeEvent.people} people, {activeEvent.promises} promises
            </p>
          </div>
        )}
      </aside>

      {/* Page content */}
      <main className="mx-auto max-w-[480px] px-4 pb-28 pt-6 lg:ml-[220px] lg:mr-0 lg:max-w-[880px] lg:px-10 lg:pb-10">
        {children}
      </main>

      <BottomBar />
    </div>
  );
}
