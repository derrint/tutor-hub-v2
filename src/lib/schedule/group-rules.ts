import type { EducationLevel } from "@/lib/domain/types";
import type { ScheduleRule, Student } from "@prisma/client";

export type RecurringSessionView = {
  id: string;
  studentId: string;
  studentName: string;
  level: EducationLevel;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

type RuleWithStudent = ScheduleRule & { student: Student };

/**
 * Groups DB rules that share the same student + time into one FullCalendar-style rule.
 * Uses the first rule id in the group as the calendar event id (stable for delete).
 */
export function groupScheduleRulesForCalendar(
  rules: RuleWithStudent[],
): RecurringSessionView[] {
  const map = new Map<string, RecurringSessionView>();

  for (const rule of rules) {
    const key = `${rule.studentId}|${rule.startTime}|${rule.endTime}`;
    const level = rule.student.level as EducationLevel;
    const existing = map.get(key);
    if (existing) {
      if (!existing.daysOfWeek.includes(rule.dayOfWeek)) {
        existing.daysOfWeek.push(rule.dayOfWeek);
        existing.daysOfWeek.sort((a, b) => a - b);
      }
      continue;
    }
    map.set(key, {
      id: rule.id,
      studentId: rule.studentId,
      studentName: rule.student.name,
      level,
      daysOfWeek: [rule.dayOfWeek],
      startTime: rule.startTime,
      endTime: rule.endTime,
    });
  }

  return [...map.values()];
}

/** All Prisma rule ids represented by a grouped calendar view id. */
export function ruleIdsInCalendarGroup(
  rules: RuleWithStudent[],
  calendarRuleId: string,
): string[] {
  const anchor = rules.find((r) => r.id === calendarRuleId);
  if (!anchor) return [calendarRuleId];

  return rules
    .filter(
      (r) =>
        r.studentId === anchor.studentId &&
        r.startTime === anchor.startTime &&
        r.endTime === anchor.endTime,
    )
    .map((r) => r.id);
}
