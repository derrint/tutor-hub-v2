import type { EducationLevel, RecurringSession } from "@/lib/domain/types";
import { storedDateToIsoDate } from "@/lib/datetime/calendar-date";
import type { ScheduleRule, Student } from "@prisma/client";

export type RecurringSessionView = RecurringSession;

type RuleWithStudent = ScheduleRule & { student: Student };

/** One DB ScheduleRule → one calendar recurring event (single weekday). */
export function groupScheduleRulesForCalendar(
  rules: RuleWithStudent[],
): RecurringSessionView[] {
  return rules.map((rule) => ({
    id: rule.id,
    studentId: rule.studentId,
    studentName: rule.student.name,
    level: rule.student.level as EducationLevel,
    daysOfWeek: [rule.dayOfWeek],
    startTime: rule.startTime,
    endTime: rule.endTime,
    startDate: storedDateToIsoDate(rule.startDate),
  }));
}
