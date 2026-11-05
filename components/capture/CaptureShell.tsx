import Link from "next/link";
import { XIcon } from "../Icons";

// The dark capture surface. Phone: covers the whole screen. Laptop: a centered panel.
export function shellClass(extra = "") {
  return `fixed inset-0 z-50 flex flex-col overflow-hidden bg-ink text-white lg:static lg:z-auto lg:mx-auto lg:h-[min(720px,calc(100vh-80px))] lg:max-w-[560px] lg:rounded-[24px] ${extra}`;
}

export function TopBar({ eventName }: { eventName?: string | null }) {
  return (
    <div className="flex items-center justify-between px-3 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
      <Link
        href="/today"
        aria-label="Close"
        className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <XIcon />
      </Link>
      {eventName ? (
        <span className="max-w-[60%] truncate rounded-full bg-white/15 px-3 py-1 text-sm">{eventName}</span>
      ) : (
        <span />
      )}
      <span className="h-11 w-11" />
    </div>
  );
}
