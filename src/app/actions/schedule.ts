"use server";

import { calendarDateToStoredDate } from "@/lib/datetime/calendar-date";
import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import {
  ruleIdsInCalendarGroup,
} from "@/lib/schedule/group-rules";
import {
  ensureSessionsGenerated,
  generateSessionsInWindow,
  defaultSessionGenerationWindow,
} from "@/lib/schedule/generate-sessions";

const RULE_START_FALLBACK = calendarDateToStoredDate(2026, 1, 1);

export type RecurringSessionInput = {
  id?: string;
  studentId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

export async function upsertRecurringSessionAction(input: RecurringSessionInput) {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });
  if (!student) return null;

  const days = [...new Set(input.daysOfWeek)].sort((a, b) => a - b);
  if (days.length === 0) return null;

  const allRules = await prisma.scheduleRule.findMany({
    include: { student: true },
  });

  const existingGroupIds = input.id
    ? ruleIdsInCalendarGroup(allRules, input.id)
    : [];

  if (existingGroupIds.length > 0) {
    await prisma.scheduleRule.deleteMany({
      where: { id: { in: existingGroupIds } },
    });
  }

  const groupId = input.id ?? `r-${Date.now().toString(36)}`;

  for (const dayOfWeek of days) {
    await prisma.scheduleRule.create({
      data: {
        id: `${groupId}-d${dayOfWeek}`,
        studentId: input.studentId,
        dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        startDate: RULE_START_FALLBACK,
      },
    });
  }

  await generateSessionsInWindow(defaultSessionGenerationWindow());
  revalidateAdminRoutes();

  const rules = await prisma.scheduleRule.findMany({
    where: { studentId: input.studentId },
    include: { student: true },
  });

  const anchorId = `${groupId}-d${days[0]}`;
  return anchorId;
}

export async function deleteRecurringSessionAction(calendarRuleId: string) {
  const allRules = await prisma.scheduleRule.findMany({
    include: { student: true },
  });
  const ids = ruleIdsInCalendarGroup(allRules, calendarRuleId);
  if (ids.length === 0) return false;

  await prisma.session.deleteMany({
    where: { scheduleRuleId: { in: ids } },
  });
  await prisma.scheduleRule.deleteMany({ where: { id: { in: ids } } });
  revalidateAdminRoutes();
  return true;
}

export async function ensureSessionsAction() {
  await ensureSessionsGenerated();
}
