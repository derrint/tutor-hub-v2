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
import { recurringSessionFromFields } from "@/lib/schedule/map-recurring-session";
import type { RecurringSession } from "@/lib/domain/types";
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

export type UpsertRecurringSessionResult =
  | { ok: true; session: RecurringSession; previousRuleId?: string }
  | { ok: false; reason: "invalid" };

export type DeleteRecurringSessionResult =
  | { ok: true; deletedRuleId: string }
  | { ok: false; reason: "invalid" };

function ruleIdForDay(existingId: string | undefined, dayOfWeek: number): string {
  if (!existingId) {
    return `r-${Date.now().toString(36)}-d${dayOfWeek}`;
  }
  const base = existingId.replace(/-d\d+$/, "");
  return `${base}-d${dayOfWeek}`;
}

export async function upsertRecurringSessionAction(
  input: RecurringSessionInput,
): Promise<UpsertRecurringSessionResult> {
  const tutorId = await requireActiveTutorId();
  try {
    await assertStudentInTutor(input.studentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return { ok: false, reason: "invalid" };
    throw error;
  }

  const student = await prisma.student.findFirst({
    where: { id: input.studentId, tutorId },
  });
  if (!student) return { ok: false, reason: "invalid" };

  const uniqueDays = [...new Set(input.daysOfWeek)].sort((a, b) => a - b);
  if (uniqueDays.length === 0) return { ok: false, reason: "invalid" };

  /** UI creates one weekday per slot; only the first day is persisted. */
  const dayOfWeek = uniqueDays[0];

  const startDate =
    parseIsoDateToStoredDate(input.startDate) ??
    parseIsoDateToStoredDate(todayIsoDateLocal());
  if (!startDate) return { ok: false, reason: "invalid" };

  if (input.id) {
    try {
      await assertScheduleRuleInTutor(input.id, tutorId);
    } catch (error) {
      if (error instanceof TutorScopeError) return { ok: false, reason: "invalid" };
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

  const session = recurringSessionFromFields(
    {
      id: ruleId,
      studentId: input.studentId,
      dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      startDate,
    },
    student,
  );

  const previousRuleId =
    input.id && input.id !== ruleId ? input.id : undefined;

  return { ok: true, session, previousRuleId };
}

export async function deleteRecurringSessionAction(
  calendarRuleId: string,
): Promise<DeleteRecurringSessionResult> {
  const tutorId = await requireActiveTutorId();
  try {
    await assertScheduleRuleInTutor(calendarRuleId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return { ok: false, reason: "invalid" };
    throw error;
  }

  await prisma.session.deleteMany({
    where: { scheduleRuleId: calendarRuleId, tutorId },
  });
  await prisma.scheduleRule.deleteMany({ where: { id: calendarRuleId } });
  revalidateAdminRoutes();
  return { ok: true, deletedRuleId: calendarRuleId };
}

export async function ensureSessionsAction() {
  const { ensureSessionsGeneratedIfNeeded } = await import(
    "@/lib/schedule/generate-sessions"
  );
  const tutorId = await requireActiveTutorId();
  await ensureSessionsGeneratedIfNeeded(prisma, tutorId);
}
