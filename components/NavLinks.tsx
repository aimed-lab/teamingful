"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, CameraIcon, HomeIcon, NetworkIcon, UserIcon } from "./Icons";

// True when `href` is the current page (or a page inside it).
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const SIDEBAR_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/teams", label: "Teams" },
  { href: "/promises", label: "Promises" },
  { href: "/events", label: "Events" },
  { href: "/network", label: "Network" },
  { href: "/me", label: "Me" },
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
          className={`flex min-h-[44px] items-center rounded-btn px-3 ${
            isActive(item.href)
              ? "bg-green-light font-medium text-green"
              : "text-ink hover:bg-surface"
          }`}
        >
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
        isActive(href) ? "font-medium text-green" : "text-muted"
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white lg:hidden">
      <div className="mx-auto grid max-w-[480px] grid-cols-5 items-center">
        {item("/", "Today", <HomeIcon />)}
        {item("/network", "Network", <NetworkIcon />)}
        <Link
          href="/capture"
          aria-label="Capture"
          className="-mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-green text-white shadow-lg ring-4 ring-white"
        >
          <CameraIcon />
        </Link>
        {item("/promises", "Promises", <BellIcon />)}
        {item("/me", "Me", <UserIcon />)}
      </div>
    </nav>
  );
}
