import type { EducationLevel, RecurringSession } from "@/lib/domain/types";
import { storedDateToIsoDate } from "@/lib/datetime/calendar-date";
import type { ScheduleRule, Student } from "@prisma/client";

type RuleWithStudent = ScheduleRule & { student: Student };

/** One DB ScheduleRule → one calendar recurring event (single weekday). */
export function mapScheduleRuleToRecurringSession(
  rule: RuleWithStudent,
): RecurringSession {
  return {
    id: rule.id,
    studentId: rule.studentId,
    studentName: rule.student.name,
    level: rule.student.level as EducationLevel,
    daysOfWeek: [rule.dayOfWeek],
    startTime: rule.startTime,
    endTime: rule.endTime,
    startDate: storedDateToIsoDate(rule.startDate),
  };
}

export function recurringSessionFromFields(
  rule: Pick<
    ScheduleRule,
    "id" | "studentId" | "dayOfWeek" | "startTime" | "endTime" | "startDate"
  >,
  student: Student,
): RecurringSession {
  return {
    id: rule.id,
    studentId: rule.studentId,
    studentName: student.name,
    level: student.level as EducationLevel,
    daysOfWeek: [rule.dayOfWeek],
    startTime: rule.startTime,
    endTime: rule.endTime,
    startDate: storedDateToIsoDate(rule.startDate),
  };
}

export function recurringSessionsMatch(
  a: RecurringSession,
  b: RecurringSession,
): boolean {
  return (
    a.id === b.id &&
    a.studentId === b.studentId &&
    a.studentName === b.studentName &&
    a.level === b.level &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.startDate === b.startDate &&
    a.daysOfWeek.length === b.daysOfWeek.length &&
    a.daysOfWeek.every((d, i) => d === b.daysOfWeek[i])
  );
}
