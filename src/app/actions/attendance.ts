"use server";

import { parseOccurrenceId } from "@/lib/attendance/parse-occurrence-id";
import { calendarDateToStoredDate } from "@/lib/datetime/calendar-date";
import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";

export async function setOccurrenceAbsentAction(
  occurrenceId: string,
  absent: boolean,
) {
  const parsed = parseOccurrenceId(occurrenceId);
  if (!parsed) return;

  const date = calendarDateToStoredDate(
    parsed.year,
    parsed.month,
    parsed.day,
  );

  await prisma.session.updateMany({
    where: {
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

  const date = calendarDateToStoredDate(
    parsed.year,
    parsed.month,
    parsed.day,
  );

  const sessions = await prisma.session.findMany({
    where: { studentId: parsed.studentId, date },
  });

  const anyAbsent = sessions.some((s) => s.status === "ABSENT");
  const nextAbsent = !anyAbsent;

  await prisma.session.updateMany({
    where: { studentId: parsed.studentId, date },
    data: { status: nextAbsent ? "ABSENT" : "SCHEDULED" },
  });

  revalidateAdminRoutes();
}
