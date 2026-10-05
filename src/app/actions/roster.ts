"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import { normalizeHonorificStored } from "@/lib/whatsapp/format-honorific";
import {
  pickNextStudentCalendarColorKey,
  type StudentCalendarColorKey,
} from "@/lib/students/calendar-colors";
import type { EducationLevel, StudentStatus } from "@/lib/domain/types";

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
  const id = input.id ?? newId("p");
  const parent = await prisma.parent.upsert({
    where: { id },
    create: {
      id,
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
  const linked = await prisma.student.count({ where: { parentId } });
  if (linked > 0) return { ok: false as const };

  await prisma.parent.delete({ where: { id: parentId } });
  revalidateAdminRoutes();
  return { ok: true as const };
}

export async function upsertStudentAction(input: StudentInput) {
  const id = input.id ?? newId("m");
  const existing = input.id
    ? await prisma.student.findUnique({ where: { id: input.id } })
    : null;

  const allStudents = await prisma.student.findMany({
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

  const student = await prisma.student.upsert({
    where: { id },
    create: {
      id,
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

  revalidateAdminRoutes();
  return student;
}

export async function deleteStudentAction(studentId: string) {
  await prisma.session.deleteMany({ where: { studentId } });
  await prisma.scheduleRule.deleteMany({ where: { studentId } });
  await prisma.student.delete({ where: { id: studentId } });
  revalidateAdminRoutes();
}
