"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import type { InvoicePreview, InvoiceStatus } from "@/lib/domain/types";
import {
  buildAbsentOccurrenceIdSet,
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
