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
  return buildStudentOccurrenceId(
    studentId,
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
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
