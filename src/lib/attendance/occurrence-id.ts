import { calendarPartsForOccurrence } from "@/lib/datetime/tutor-calendar";
import type { InvoicePeriod } from "@/utils/format";

/** Stable key for one billable session (student + calendar date). */
export function buildStudentOccurrenceId(
  studentId: string,
  year: number,
  month: number,
  dayOfMonth: number,
): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(dayOfMonth).padStart(2, "0");
  return `${studentId}:${year}-${mm}-${dd}`;
}

export function buildStudentOccurrenceIdFromDate(
  studentId: string,
  date: Date,
): string {
  const { year, month, day } = calendarPartsForOccurrence(date);
  return buildStudentOccurrenceId(studentId, year, month, day);
}

export function buildStudentOccurrenceIdForPeriodDay(
  studentId: string,
  period: InvoicePeriod,
  dayOfMonth: number,
): string {
  return buildStudentOccurrenceId(
    studentId,
    period.year,
    period.month,
    dayOfMonth,
  );
}
