"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Remembers the browser's time zone in a cookie so server pages can work out the user's "today".
// Refreshes the page once if the zone was missing or changed.
export default function TimeZoneCookie() {
  const router = useRouter();

  useEffect(() => {
    let zone: string;
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!zone) return;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.slice(3);
    if (current && decodeURIComponent(current) === zone) return;
    document.cookie = `tz=${encodeURIComponent(zone)}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [router]);

  return null;
}
