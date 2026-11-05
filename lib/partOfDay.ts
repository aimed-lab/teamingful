// "morning" | "afternoon" | "evening" from an hour (0-23).
export function partOfDay(hour: number) {
  return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
}
