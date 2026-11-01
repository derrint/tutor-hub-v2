import type { RecurringSession } from "@/lib/domain/types";
import { mapScheduleRuleToRecurringSession } from "@/lib/schedule/map-recurring-session";
import type { ScheduleRule, Student } from "@prisma/client";

export type RecurringSessionView = RecurringSession;

type RuleWithStudent = ScheduleRule & { student: Student };

export function groupScheduleRulesForCalendar(
  rules: RuleWithStudent[],
): RecurringSessionView[] {
  return rules.map(mapScheduleRuleToRecurringSession);
}
