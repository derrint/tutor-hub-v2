"use server";

import {
  parseIsoDateToStoredDate,
  todayIsoDateLocal,
} from "@/lib/datetime/calendar-date";
import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import {
  ruleIdsInCalendarGroup,
} from "@/lib/schedule/group-rules";
import {
  generateSessionsInWindow,
  defaultSessionGenerationWindow,
} from "@/lib/schedule/generate-sessions";

export type RecurringSessionInput = {
  id?: string;
  studentId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  /** First calendar day the weekly slot applies (`YYYY-MM-DD`). */
  startDate: string;
};

export async function upsertRecurringSessionAction(input: RecurringSessionInput) {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });
  if (!student) return null;

  const days = [...new Set(input.daysOfWeek)].sort((a, b) => a - b);
  if (days.length === 0) return null;

  const startDate =
    parseIsoDateToStoredDate(input.startDate) ??
    parseIsoDateToStoredDate(todayIsoDateLocal());
  if (!startDate) return null;

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
        startDate,
      },
    });
  }

  const newRuleIds = days.map((dayOfWeek) => `${groupId}-d${dayOfWeek}`);
  await prisma.session.deleteMany({
    where: {
      scheduleRuleId: { in: newRuleIds },
      date: { lt: startDate },
    },
  });

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
  const { ensureSessionsGeneratedIfNeeded } = await import(
    "@/lib/schedule/generate-sessions"
  );
  await ensureSessionsGeneratedIfNeeded();
}
