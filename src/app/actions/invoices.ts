"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { mapParent, mapStudent } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { InvoicePreview, InvoiceStatus } from "@/lib/domain/types";
import {
  buildAbsentOccurrenceIdSet,
  getInvoicesForPeriodFromDb,
  loadSessionsForGenerationWindow,
  markInvoicePaidInDb,
  markInvoiceUnpaidInDb,
} from "@/lib/invoices/queries";
import type { InvoicePeriod } from "@/utils/format";
import { parseInvoiceId } from "@/lib/invoices/invoice-id";
import {
  assertParentInTutor,
  TutorScopeError,
} from "@/lib/tutor-context/assert-tutor-scope";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

export type SetInvoiceStatusResult =
  | { ok: true; invoice: InvoicePreview }
  | { ok: false; reason: "forbidden" | "invalid" };

/** Server-derived invoice list for one billing month (active tutor). */
export async function listInvoicesForPeriodAction(
  period: InvoicePeriod,
): Promise<InvoicePreview[]> {
  const tutorId = await requireActiveTutorId();
  const [sessions, studentsRows, parentsRows] = await Promise.all([
    loadSessionsForGenerationWindow(tutorId),
    prisma.student.findMany({ where: { tutorId } }),
    prisma.parent.findMany({ where: { tutorId } }),
  ]);
  const absentOccurrenceIds = buildAbsentOccurrenceIdSet(sessions);
  const students = studentsRows.map(mapStudent);
  const parents = parentsRows.map(mapParent);
  return getInvoicesForPeriodFromDb(
    tutorId,
    period,
    absentOccurrenceIds,
    sessions,
    students,
    parents,
  );
}

export async function setInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  period: InvoicePeriod,
  parentId: string,
): Promise<SetInvoiceStatusResult> {
  const tutorId = await requireActiveTutorId();
  try {
    await assertParentInTutor(parentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) {
      return { ok: false, reason: "forbidden" };
    }
    throw error;
  }
  const sessions = await loadSessionsForGenerationWindow(tutorId);
  const absentOccurrenceIds = buildAbsentOccurrenceIdSet(sessions);

  try {
    if (status === "PAID") {
      const invoice = await markInvoicePaidInDb(
        tutorId,
        invoiceId,
        period,
        parentId,
        absentOccurrenceIds,
      );
      revalidateAdminRoutes();
      return { ok: true, invoice };
    }

    const parsed = parseInvoiceId(invoiceId);
    const resolvedParentId = parsed?.parentId ?? parentId;
    const resolvedPeriod = parsed?.period ?? period;
    try {
      await assertParentInTutor(resolvedParentId, tutorId);
    } catch (error) {
      if (error instanceof TutorScopeError) {
        return { ok: false, reason: "forbidden" };
      }
      throw error;
    }
    const invoice = await markInvoiceUnpaidInDb(
      tutorId,
      resolvedParentId,
      resolvedPeriod,
      absentOccurrenceIds,
    );
    revalidateAdminRoutes();
    return { ok: true, invoice };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
