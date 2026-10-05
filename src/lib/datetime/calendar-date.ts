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
