import {
  endOfMonthCalendar,
  startOfMonthCalendar,
  storedDateToCalendarParts,
} from "@/lib/datetime/calendar-date";
import { prisma } from "@/lib/db/prisma";
import { defaultSessionGenerationWindow } from "@/lib/schedule/generate-sessions";
import type { PrismaClient } from "@prisma/client";

/**
 * Updates Session.fee for a student in calendar months that are not PAID
 * for the student's parent. Skips rows linked to an invoice item.
 */
export async function syncSessionFeesForUnpaidMonths(
  studentId: string,
  parentId: string | null | undefined,
  newFeePerSession: number,
  client: PrismaClient = prisma,
): Promise<void> {
  if (!parentId) return;

  const window = defaultSessionGenerationWindow();
  const sessions = await client.session.findMany({
    where: {
      studentId,
      date: { gte: window.from, lte: window.to },
      invoiceItemId: null,
    },
    select: { date: true },
  });

  if (sessions.length === 0) return;

  const monthKeys = new Set<string>();
  for (const session of sessions) {
    const { year, month } = storedDateToCalendarParts(session.date);
    monthKeys.add(`${year}-${month}`);
  }

  for (const key of monthKeys) {
    const [yearStr, monthStr] = key.split("-");
    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10);

    const paid = await client.invoice.findUnique({
      where: {
        parentId_month_year: { parentId, month, year },
      },
      select: { status: true },
    });
    if (paid?.status === "PAID") continue;

    const from = startOfMonthCalendar(year, month);
    const to = endOfMonthCalendar(year, month);

    await client.session.updateMany({
      where: {
        studentId,
        date: { gte: from, lte: to },
        invoiceItemId: null,
      },
      data: { fee: newFeePerSession },
    });
  }
}
