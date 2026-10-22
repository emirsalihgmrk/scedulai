// "45 min" below an hour, "3 h 20 min" above.
export function formatListeningTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

// Days are the learner's local "YYYY-MM-DD", so they are formatted as UTC
// midnight to keep the calendar date.
export function formatDay(
  day: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}
