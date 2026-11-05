"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#labs", label: "For labs" },
];

// Sticky top bar. Gets a thin bottom border once the page scrolls.
export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-paper ${scrolled ? "border-line" : "border-transparent"}`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between px-6 lg:px-8">
        <Logo />

        <nav className="hidden rounded-full border border-line bg-white p-1 lg:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-medium text-ink hover:bg-paper"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <Link
            href="/signin"
            className="inline-flex min-h-[44px] items-center whitespace-nowrap px-2 text-sm font-medium text-ink hover:underline sm:px-3"
          >
            Sign in
          </Link>
          <Link href="/signin" className="btn whitespace-nowrap px-4 text-sm sm:px-5">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
