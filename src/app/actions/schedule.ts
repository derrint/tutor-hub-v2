"use server";

import {
  parseIsoDateToStoredDate,
  todayIsoDateLocal,
} from "@/lib/datetime/calendar-date";
import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
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

function ruleIdForDay(existingId: string | undefined, dayOfWeek: number): string {
  if (!existingId) {
    return `r-${Date.now().toString(36)}-d${dayOfWeek}`;
  }
  const base = existingId.replace(/-d\d+$/, "");
  return `${base}-d${dayOfWeek}`;
}

export async function upsertRecurringSessionAction(input: RecurringSessionInput) {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });
  if (!student) return null;

  const uniqueDays = [...new Set(input.daysOfWeek)].sort((a, b) => a - b);
  if (uniqueDays.length === 0) return null;

  /** UI creates one weekday per slot; only the first day is persisted. */
  const dayOfWeek = uniqueDays[0];

  const startDate =
    parseIsoDateToStoredDate(input.startDate) ??
    parseIsoDateToStoredDate(todayIsoDateLocal());
  if (!startDate) return null;

  if (input.id) {
    await prisma.session.deleteMany({
      where: { scheduleRuleId: input.id },
    });
    await prisma.scheduleRule.deleteMany({
      where: { id: input.id },
    });
  }

  const ruleId = ruleIdForDay(input.id, dayOfWeek);

  await prisma.scheduleRule.create({
    data: {
      id: ruleId,
      studentId: input.studentId,
      dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      startDate,
    },
  });

  await prisma.session.deleteMany({
    where: {
      scheduleRuleId: ruleId,
      date: { lt: startDate },
    },
  });

  await generateSessionsInWindow(defaultSessionGenerationWindow());
  revalidateAdminRoutes();

  return ruleId;
}

export async function deleteRecurringSessionAction(calendarRuleId: string) {
  const rule = await prisma.scheduleRule.findUnique({
    where: { id: calendarRuleId },
  });
  if (!rule) return false;

  await prisma.session.deleteMany({
    where: { scheduleRuleId: calendarRuleId },
  });
  await prisma.scheduleRule.deleteMany({ where: { id: calendarRuleId } });
  revalidateAdminRoutes();
  return true;
}

export async function ensureSessionsAction() {
  const { ensureSessionsGeneratedIfNeeded } = await import(
    "@/lib/schedule/generate-sessions"
  );
  await ensureSessionsGeneratedIfNeeded();
}
