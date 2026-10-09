import { TUTOR_TIME_ZONE } from "@/utils/time-of-day";

/** Calendar Y-M-D stored as UTC noon so month/day stay stable across time zones. */
export function calendarDateToStoredDate(
  year: number,
  month: number,
  day: number,
): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function storedDateToCalendarParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** 0 = Sunday … 6 = Saturday (same as FullCalendar / mock). */
export function weekdayForCalendarDate(
  year: number,
  month: number,
  day: number,
): number {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay();
}

export function startOfMonthCalendar(year: number, month: number): Date {
  return calendarDateToStoredDate(year, month, 1);
}

export function endOfMonthCalendar(year: number, month: number): Date {
  const daysInMonth = new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
  return calendarDateToStoredDate(year, month, daysInMonth);
}

/** `YYYY-MM-DD` for `<input type="date">` — tutor today in WIB. */
export function todayIsoDateLocal(reference: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TUTOR_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

/** Parse `YYYY-MM-DD` from the slot form into a stored calendar date. */
export function parseIsoDateToStoredDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return calendarDateToStoredDate(year, month, day);
}

export function storedDateToIsoDate(date: Date): string {
  const { year, month, day } = storedDateToCalendarParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
