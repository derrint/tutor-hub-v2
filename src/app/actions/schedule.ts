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
import {
  assertScheduleRuleInTutor,
  assertStudentInTutor,
  TutorScopeError,
} from "@/lib/tutor-context/assert-tutor-scope";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

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
  const tutorId = await requireActiveTutorId();
  try {
    await assertStudentInTutor(input.studentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return null;
    throw error;
  }

  const student = await prisma.student.findFirst({
    where: { id: input.studentId, tutorId },
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
    try {
      await assertScheduleRuleInTutor(input.id, tutorId);
    } catch (error) {
      if (error instanceof TutorScopeError) return null;
      throw error;
    }
    await prisma.session.deleteMany({
      where: { scheduleRuleId: input.id, tutorId },
    });
    await prisma.scheduleRule.deleteMany({
      where: { id: input.id, studentId: input.studentId },
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

  await generateSessionsInWindow(
    defaultSessionGenerationWindow(),
    prisma,
    tutorId,
  );
  revalidateAdminRoutes();

  return ruleId;
}

export async function deleteRecurringSessionAction(calendarRuleId: string) {
  const tutorId = await requireActiveTutorId();
  try {
    await assertScheduleRuleInTutor(calendarRuleId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return false;
    throw error;
  }

  await prisma.session.deleteMany({
    where: { scheduleRuleId: calendarRuleId, tutorId },
  });
  await prisma.scheduleRule.deleteMany({ where: { id: calendarRuleId } });
  revalidateAdminRoutes();
  return true;
}

export async function ensureSessionsAction() {
  const { ensureSessionsGeneratedIfNeeded } = await import(
    "@/lib/schedule/generate-sessions"
  );
  const tutorId = await requireActiveTutorId();
  await ensureSessionsGeneratedIfNeeded(prisma, tutorId);
}
