import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
} from "@/lib/datetime/calendar-date";
import { TUTOR_TIME_ZONE } from "@/utils/time-of-day";

/** Calendar Y-M-D in the tutor schedule zone (WIB). */
export function getTutorCalendarParts(reference: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: TUTOR_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
  const [year, month, day] = iso
    .split("-")
    .map((part) => Number.parseInt(part, 10));
  return { year, month, day };
}

/** DB / invoice dates stored as UTC noon for a calendar day. */
export function isStoredCalendarDate(date: Date): boolean {
  return (
    date.getUTCHours() === 12 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/** Occurrence keys and billing use tutor (WIB) calendar days. */
export function calendarPartsForOccurrence(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  if (isStoredCalendarDate(date)) {
    return storedDateToCalendarParts(date);
  }
  return getTutorCalendarParts(date);
}

export function tutorTodayStoredDate(reference: Date = new Date()): Date {
  const { year, month, day } = getTutorCalendarParts(reference);
  return calendarDateToStoredDate(year, month, day);
}

/** `YYYY-MM-DD` for forms — tutor “today” in WIB. */
export function tutorTodayIsoDate(reference: Date = new Date()): string {
  const { year, month, day } = getTutorCalendarParts(reference);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
