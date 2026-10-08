import { buildStudentOccurrenceIdForPeriodDay } from "@/lib/attendance/occurrence-id";
import { storedDateToCalendarParts } from "@/lib/datetime/calendar-date";
import { prisma } from "@/lib/db/prisma";
import { defaultSessionGenerationWindow } from "@/lib/schedule/generate-sessions";

/** Absent session keys for invoice derive — without loading every session in the window. */
export async function loadAbsentOccurrenceIds(): Promise<string[]> {
  const window = defaultSessionGenerationWindow();
  const rows = await prisma.session.findMany({
    where: {
      status: "ABSENT",
      date: { gte: window.from, lte: window.to },
    },
    select: { studentId: true, date: true },
  });

  const ids: string[] = [];
  for (const row of rows) {
    const { year, month, day } = storedDateToCalendarParts(row.date);
    ids.push(
      buildStudentOccurrenceIdForPeriodDay(row.studentId, { year, month }, day),
    );
  }
  return ids;
}
