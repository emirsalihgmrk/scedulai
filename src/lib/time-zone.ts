const DAY_MS = 24 * 60 * 60 * 1000;

// The learner's calendar day ("YYYY-MM-DD") at `date`. Days are counted in UTC
// until the browser has reported their time zone.
export function getLocalDay(date: Date, timeZone: string | null): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone ?? "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Calendar arithmetic on "YYYY-MM-DD" strings, free of time zones and DST.
export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

// Whole days from `from` to `to` (positive when `to` is later).
export function getDaysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((end - start) / DAY_MS);
}
