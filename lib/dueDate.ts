// Turn a spoken due date ("Friday", "next week") into a calendar date.
// `today` is the user's own local date as YYYY-MM-DD, sent by their browser.

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parse(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
}

export function resolveDue(hint: string | null | undefined, today: string): string | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(h)) return h;

  if (/\b(today|tonight|this evening)\b/.test(h)) return today;
  if (/\btomorrow\b/.test(h)) return addDays(today, 1);

  if (/\bnext week\b/.test(h)) {
    // next Monday
    const dow = parse(today).getUTCDay();
    return addDays(today, ((8 - dow) % 7) || 7);
  }

  if (/\bend of (the )?month\b/.test(h)) {
    const d = parse(today);
    return fmt(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
  }

  for (let i = 0; i < 7; i++) {
    const name = DAYS[i];
    if (h.includes(name) || new RegExp(`\\b${name.slice(0, 3)}\\b`).test(h)) {
      // the next such day, never today
      const dow = parse(today).getUTCDay();
      return addDays(today, ((i - dow + 7) % 7) || 7);
    }
  }
  return null;
}

// "today", "tomorrow", a weekday name within the next 6 days, else "Nov 14".
export function formatDue(due: string | null | undefined, today: string): string | null {
  if (!due) return null;
  const diff = Math.round((parse(due).getTime() - parse(today).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  const d = parse(due);
  if (diff > 1 && diff < 7) {
    const n = DAYS[d.getUTCDay()];
    return n[0].toUpperCase() + n.slice(1);
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// "Nov 4" (adds the year when it is not this year)
export function formatDay(iso: string | null | undefined, today: string): string {
  if (!iso) return "";
  const d = parse(iso);
  const sameYear = d.getUTCFullYear() === parse(today).getUTCFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
}
