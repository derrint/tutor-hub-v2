import { storedDateToCalendarParts } from "@/lib/datetime/calendar-date";
import { getTutorCalendarParts } from "@/lib/datetime/tutor-calendar";

export type SessionClockPhase = "upcoming" | "ongoing" | "done";

export { getTutorCalendarParts };

const HHMM = /^(\d{1,2}):(\d{2})$/;

/** UTC ms for `HH:mm` on a calendar day in WIB (fixed UTC+7). */
export function sessionInstantUtcMs(
  parts: { year: number; month: number; day: number },
  hhmm: string,
): number | null {
  const match = HHMM.exec(hhmm.trim());
  if (!match) return null;

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day, hours - 7, minutes, 0, 0);
}

export function getSessionClockPhase(
  nowMs: number,
  startMs: number,
  endMs: number,
): SessionClockPhase {
  if (nowMs >= endMs) return "done";
  if (nowMs >= startMs) return "ongoing";
  return "upcoming";
}

/** Calendar day for a session list (stored date or “today” in WIB). */
export function calendarPartsForSessionListDay(
  sessionDate: Date | undefined,
  nowMs: number,
): { year: number; month: number; day: number } {
  if (sessionDate != null) {
    return storedDateToCalendarParts(sessionDate);
  }
  return getTutorCalendarParts(new Date(nowMs));
}
