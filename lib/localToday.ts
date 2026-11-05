import { cookies } from "next/headers";

const FALLBACK_ZONE = "America/Chicago";

// "Today" as YYYY-MM-DD in a given time zone, plus an optional number of days.
export function todayIn(timeZone: string, offsetDays = 0): string {
  let iso: string;
  try {
    iso = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
      new Date()
    );
  } catch {
    iso = new Intl.DateTimeFormat("en-CA", {
      timeZone: FALLBACK_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  if (!offsetDays) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + offsetDays)).toISOString().slice(0, 10);
}

// Server helper: the user's today, from the tz cookie set by TimeZoneCookie.
export async function getLocalToday(offsetDays = 0): Promise<string> {
  const store = await cookies();
  return todayIn(store.get("tz")?.value ?? FALLBACK_ZONE, offsetDays);
}
