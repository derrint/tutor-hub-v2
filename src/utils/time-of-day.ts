/** Tutor-facing clocks (schedule, greetings) use WIB. */
export const TUTOR_TIME_ZONE = "Asia/Jakarta";

export type TimeOfDayPeriod = "morning" | "afternoon" | "evening" | "night";

function getHourInTimeZone(date: Date, timeZone: string): number {
  const hourPart = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  })
    .formatToParts(date)
    .find((part) => part.type === "hour");

  const hour = Number(hourPart?.value);
  return Number.isFinite(hour) ? hour : date.getHours();
}

/** Same hour buckets as WhatsApp `getIndonesianTimeOfDayGreeting`. */
export function getTimeOfDayPeriod(
  date: Date = new Date(),
  timeZone: string = TUTOR_TIME_ZONE,
): TimeOfDayPeriod {
  const hour = getHourInTimeZone(date, timeZone);

  if (hour < 11) return "morning";
  if (hour < 15) return "afternoon";
  if (hour < 18) return "evening";
  return "night";
}
