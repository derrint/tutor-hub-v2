"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import { normalizeHonorificStored } from "@/lib/whatsapp/format-honorific";
import {
  pickNextStudentCalendarColorKey,
  type StudentCalendarColorKey,
} from "@/lib/students/calendar-colors";
import type { EducationLevel, StudentStatus } from "@/lib/domain/types";
import { deactivateStudentSchedule } from "@/lib/roster/deactivate-student";
import { syncSessionFeesForUnpaidMonths } from "@/lib/roster/sync-session-fees";
import {
  assertParentInTutor,
  assertStudentInTutor,
  TutorScopeError,
} from "@/lib/tutor-context/assert-tutor-scope";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

export type ParentInput = {
  id?: string;
  name: string;
  salutation: string;
  honorific: string;
  whatsapp: string;
};

export type StudentInput = {
  id?: string;
  name: string;
  age: number;
  level: EducationLevel;
  feePerSession: number;
  status: StudentStatus;
  parentId: string;
  calendarColorKey?: string;
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function upsertParentAction(input: ParentInput) {
  const tutorId = await requireActiveTutorId();
  const id = input.id ?? newId("p");
  if (input.id) {
    await assertParentInTutor(input.id, tutorId);
  }
  const parent = await prisma.parent.upsert({
    where: { id },
    create: {
      id,
      tutorId,
      name: input.name.trim(),
      salutation: input.salutation.trim(),
      honorific: normalizeHonorificStored(input.honorific),
      whatsapp: input.whatsapp.replace(/\D/g, ""),
    },
    update: {
      name: input.name.trim(),
      salutation: input.salutation.trim(),
      honorific: normalizeHonorificStored(input.honorific),
      whatsapp: input.whatsapp.replace(/\D/g, ""),
    },
  });
  revalidateAdminRoutes();
  return parent;
}

export async function deleteParentAction(parentId: string) {
  const tutorId = await requireActiveTutorId();
  try {
    await assertParentInTutor(parentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return { ok: false as const };
    throw error;
  }

  const linked = await prisma.student.count({
    where: { parentId, tutorId },
  });
  if (linked > 0) return { ok: false as const };

  await prisma.parent.deleteMany({ where: { id: parentId, tutorId } });
  revalidateAdminRoutes();
  return { ok: true as const };
}

export async function upsertStudentAction(input: StudentInput) {
  const tutorId = await requireActiveTutorId();
  const id = input.id ?? newId("m");

  await assertParentInTutor(input.parentId, tutorId);
  if (input.id) {
    await assertStudentInTutor(input.id, tutorId);
  }

  const existing = input.id
    ? await prisma.student.findFirst({
        where: { id: input.id, tutorId },
      })
    : null;

  const allStudents = await prisma.student.findMany({
    where: { tutorId },
    select: { calendarColorKey: true },
  });

  const calendarColorKey =
    input.calendarColorKey ??
    existing?.calendarColorKey ??
    pickNextStudentCalendarColorKey(
      allStudents.map(
        (s) => s.calendarColorKey as StudentCalendarColorKey,
      ),
    );

  const wasActive = existing?.status === "ACTIVE";
  const becomingInactive =
    wasActive && input.status === "INACTIVE";
  const feeChanged =
    existing != null && existing.feePerSession !== input.feePerSession;

  const student = await prisma.student.upsert({
    where: { id },
    create: {
      id,
      tutorId,
      name: input.name.trim(),
      age: input.age,
      level: input.level,
      feePerSession: input.feePerSession,
      status: input.status,
      parentId: input.parentId,
      calendarColorKey,
    },
    update: {
      name: input.name.trim(),
      age: input.age,
      level: input.level,
      feePerSession: input.feePerSession,
      status: input.status,
      parentId: input.parentId,
      calendarColorKey,
    },
  });

  if (becomingInactive) {
    await deactivateStudentSchedule(student.id);
  }

  if (feeChanged) {
    await syncSessionFeesForUnpaidMonths(
      student.id,
      student.parentId,
      input.feePerSession,
    );
  }

  revalidateAdminRoutes();
  return student;
}

export async function deleteStudentAction(studentId: string) {
  const tutorId = await requireActiveTutorId();
  try {
    await assertStudentInTutor(studentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return;
    throw error;
  }

  await prisma.session.deleteMany({ where: { studentId, tutorId } });
  await prisma.scheduleRule.deleteMany({ where: { studentId } });
  await prisma.student.deleteMany({ where: { id: studentId, tutorId } });
  revalidateAdminRoutes();
}
