import { buildStudentOccurrenceIdForPeriodDay } from "@/lib/attendance/occurrence-id";
import { storedDateToCalendarParts } from "@/lib/datetime/calendar-date";
import { prisma } from "@/lib/db/prisma";
import { defaultSessionGenerationWindow } from "@/lib/schedule/generate-sessions";
import { mapParent, mapStudent } from "@/lib/db/mappers";
import type { InvoicePreview } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import { buildInvoiceId } from "./generate-invoice-from-schedule";
import {
  deriveInvoiceForParent,
  invoicePreviewFromPaidRecord,
  listParentIdsWithSessionsInPeriod,
  type SessionWithStudent,
} from "./derive-from-sessions";

export async function loadSessionsForGenerationWindow(): Promise<
  SessionWithStudent[]
> {
  const window = defaultSessionGenerationWindow();
  const sessions = await prisma.session.findMany({
    where: {
      date: { gte: window.from, lte: window.to },
    },
    include: { student: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return sessions;
}

export function buildAbsentOccurrenceIdSet(
  sessions: SessionWithStudent[],
): Set<string> {
  const absent = new Set<string>();
  for (const session of sessions) {
    if (session.status !== "ABSENT") continue;
    const { year, month, day } = storedDateToCalendarParts(session.date);
    absent.add(
      buildStudentOccurrenceIdForPeriodDay(session.studentId, { year, month }, day),
    );
  }
  return absent;
}

export async function getInvoicesForPeriodFromDb(
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
  sessions: SessionWithStudent[],
  students: ReturnType<typeof mapStudent>[],
  parents: ReturnType<typeof mapParent>[],
): Promise<InvoicePreview[]> {
  const paidRecords = await prisma.invoice.findMany({
    where: { month: period.month, year: period.year },
    include: {
      parent: true,
      items: {
        include: {
          student: true,
          sessions: true,
        },
      },
    },
  });

  const paidByParent = new Map(
    paidRecords.map((inv) => [inv.parentId, invoicePreviewFromPaidRecord(inv)]),
  );

  const parentIds = listParentIdsWithSessionsInPeriod(
    period,
    students,
    sessions,
  );

  const shells: InvoicePreview[] = [];

  for (const parentId of parentIds) {
    const paid = paidByParent.get(parentId);
    if (paid) {
      shells.push(paid);
      continue;
    }

    const derived = deriveInvoiceForParent(
      parentId,
      period,
      absentOccurrenceIds,
      students,
      sessions,
      parents,
    );
    if (!derived) continue;

    shells.push({
      ...derived,
      status: "UNPAID",
    });
  }

  return shells.sort((a, b) => a.parentName.localeCompare(b.parentName));
}

export async function markInvoicePaidInDb(
  invoiceId: string,
  period: InvoicePeriod,
  parentId: string,
  absentOccurrenceIds: ReadonlySet<string>,
): Promise<void> {
  const students = (await prisma.student.findMany()).map(mapStudent);
  const parents = (await prisma.parent.findMany()).map(mapParent);
  const sessions = await loadSessionsForGenerationWindow();

  const derived = deriveInvoiceForParent(
    parentId,
    period,
    absentOccurrenceIds,
    students,
    sessions,
    parents,
  );

  if (!derived) {
    throw new Error("No billable sessions to mark paid");
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: {
        parentId_month_year: {
          parentId,
          month: period.month,
          year: period.year,
        },
      },
    });

    if (existing) {
      const existingItems = await tx.invoiceItem.findMany({
        where: { invoiceId: existing.id },
        select: { id: true },
      });
      const itemIds = existingItems.map((item) => item.id);
      if (itemIds.length > 0) {
        await tx.session.updateMany({
          where: { invoiceItemId: { in: itemIds } },
          data: { invoiceItemId: null },
        });
      }
      await tx.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
      await tx.invoice.delete({ where: { id: existing.id } });
    }

    const invoice = await tx.invoice.create({
      data: {
        id: invoiceId,
        parentId,
        month: period.month,
        year: period.year,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    for (const child of derived.children) {
      const periodSessions = sessions.filter((s) => {
        if (s.studentId !== child.id) return false;
        const { year, month, day } = storedDateToCalendarParts(s.date);
        if (year !== period.year || month !== period.month) return false;
        if (s.status === "ABSENT") return false;
        const occurrenceId = buildStudentOccurrenceIdForPeriodDay(
          s.studentId,
          period,
          day,
        );
        if (absentOccurrenceIds.has(occurrenceId)) return false;
        return child.sessionDays.includes(day);
      });

      const feePerSession =
        periodSessions.length > 0
          ? periodSessions[0].fee
          : Math.round(child.subtotal / Math.max(child.sessionCount, 1));

      const item = await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          studentId: child.id,
          sessionCount: child.sessionCount,
          feePerSession,
          subtotal: child.subtotal,
        },
      });

      for (const session of periodSessions) {
        await tx.session.update({
          where: { id: session.id },
          data: { invoiceItemId: item.id },
        });
      }
    }
  });
}

export async function markInvoiceUnpaidInDb(
  parentId: string,
  period: InvoicePeriod,
): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: {
      parentId_month_year: {
        parentId,
        month: period.month,
        year: period.year,
      },
    },
  });

  if (!invoice) return;

  await prisma.$transaction(async (tx) => {
    const items = await tx.invoiceItem.findMany({
      where: { invoiceId: invoice.id },
      select: { id: true },
    });
    const itemIds = items.map((item) => item.id);
    if (itemIds.length > 0) {
      await tx.session.updateMany({
        where: { invoiceItemId: { in: itemIds } },
        data: { invoiceItemId: null },
      });
    }
    await tx.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await tx.invoice.delete({ where: { id: invoice.id } });
  });
}

export { buildInvoiceId };
