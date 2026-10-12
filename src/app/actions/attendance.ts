"use server";

import { parseOccurrenceId } from "@/lib/attendance/parse-occurrence-id";
import { calendarDateToStoredDate } from "@/lib/datetime/calendar-date";
import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import {
  assertStudentInTutor,
  TutorScopeError,
} from "@/lib/tutor-context/assert-tutor-scope";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

async function guardOccurrenceStudent(
  studentId: string,
): Promise<string | null> {
  const tutorId = await requireActiveTutorId();
  try {
    await assertStudentInTutor(studentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return null;
    throw error;
  }
  return tutorId;
}

export async function setOccurrenceAbsentAction(
  occurrenceId: string,
  absent: boolean,
) {
  const parsed = parseOccurrenceId(occurrenceId);
  if (!parsed) return;

  const tutorId = await guardOccurrenceStudent(parsed.studentId);
  if (!tutorId) return;

  const date = calendarDateToStoredDate(
    parsed.year,
    parsed.month,
    parsed.day,
  );

  await prisma.session.updateMany({
    where: {
      tutorId,
      studentId: parsed.studentId,
      date,
    },
    data: {
      status: absent ? "ABSENT" : "SCHEDULED",
    },
  });

  revalidateAdminRoutes();
}

export async function toggleOccurrenceAbsentAction(occurrenceId: string) {
  const parsed = parseOccurrenceId(occurrenceId);
  if (!parsed) return;

  const tutorId = await guardOccurrenceStudent(parsed.studentId);
  if (!tutorId) return;

  const date = calendarDateToStoredDate(
    parsed.year,
    parsed.month,
    parsed.day,
  );

  const sessions = await prisma.session.findMany({
    where: { tutorId, studentId: parsed.studentId, date },
  });

  const anyAbsent = sessions.some((s) => s.status === "ABSENT");
  const nextAbsent = !anyAbsent;

  await prisma.session.updateMany({
    where: { tutorId, studentId: parsed.studentId, date },
    data: { status: nextAbsent ? "ABSENT" : "SCHEDULED" },
  });

  revalidateAdminRoutes();
}
