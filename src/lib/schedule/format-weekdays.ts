const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function formatWeekdayLabels(
  daysOfWeek: number[],
  label: (key: (typeof WEEKDAY_KEYS)[number]) => string,
): string {
  const names = [...daysOfWeek]
    .sort((a, b) => a - b)
    .map((day) => label(WEEKDAY_KEYS[day] ?? "sunday"));
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}
