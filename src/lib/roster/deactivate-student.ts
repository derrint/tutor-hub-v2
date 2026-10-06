import {
  parseIsoDateToStoredDate,
  todayIsoDateLocal,
} from "@/lib/datetime/calendar-date";
import { prisma } from "@/lib/db/prisma";
import type { PrismaClient } from "@prisma/client";

function todayStoredDate(): Date {
  const parsed = parseIsoDateToStoredDate(todayIsoDateLocal());
  if (!parsed) {
    throw new Error("Invalid local calendar date");
  }
  return parsed;
}

/** Stops recurrence and removes strictly future sessions; keeps today and past. */
export async function deactivateStudentSchedule(
  studentId: string,
  client: PrismaClient = prisma,
): Promise<void> {
  const today = todayStoredDate();

  await client.scheduleRule.updateMany({
    where: { studentId },
    data: { endDate: today },
  });

  await client.session.deleteMany({
    where: {
      studentId,
      date: { gt: today },
    },
  });
}
