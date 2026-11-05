"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  CalendarIcon,
  CameraIcon,
  ChecklistIcon,
  HomeIcon,
  NetworkIcon,
  TeamsIcon,
  UserIcon,
} from "./Icons";

// True when `href` is the current page (or a page inside it).
function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname.startsWith(href);
}

const SIDEBAR_ITEMS = [
  { href: "/today", label: "Today", icon: <HomeIcon size={20} /> },
  { href: "/teams", label: "Teams", icon: <TeamsIcon size={20} /> },
  { href: "/promises", label: "Promises", icon: <ChecklistIcon size={20} /> },
  { href: "/events", label: "Events", icon: <CalendarIcon size={20} /> },
  { href: "/network", label: "Network", icon: <NetworkIcon size={20} /> },
];

// Laptop: the list of links in the left sidebar.
export function SidebarLinks() {
  const isActive = useIsActive();
  return (
    <nav className="mt-6 flex flex-col gap-1">
      {SIDEBAR_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 ${
            isActive(item.href)
              ? "bg-paper font-medium text-ink shadow-[inset_3px_0_0_#2F5BFF]"
              : "text-ink hover:bg-paper"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// Phone: the fixed bar at the bottom with 5 items.
export function BottomBar() {
  const isActive = useIsActive();
  const item = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs ${
        isActive(href) ? "font-medium text-you" : "text-muted"
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white lg:hidden">
      <div className="mx-auto grid max-w-[480px] grid-cols-5 items-center">
        {item("/today", "Today", <HomeIcon />)}
        {item("/network", "Network", <NetworkIcon />)}
        <Link
          href="/capture"
          aria-label="Capture"
          className="-mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-you text-white shadow-lg ring-4 ring-paper"
        >
          <CameraIcon size={28} />
        </Link>
        {item("/promises", "Promises", <BellIcon />)}
        {item("/me", "Me", <UserIcon />)}
      </div>
    </nav>
  );
}
