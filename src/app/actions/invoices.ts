"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import {
  buildAbsentOccurrenceIdSet,
  loadSessionsForGenerationWindow,
  markInvoicePaidInDb,
  markInvoiceUnpaidInDb,
} from "@/lib/invoices/queries";
import type { InvoiceStatus } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import { parseInvoiceId } from "@/lib/invoices/build-period-invoices";
import {
  assertParentInTutor,
  TutorScopeError,
} from "@/lib/tutor-context/assert-tutor-scope";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

export async function setInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  period: InvoicePeriod,
  parentId: string,
) {
  const tutorId = await requireActiveTutorId();
  try {
    await assertParentInTutor(parentId, tutorId);
  } catch (error) {
    if (error instanceof TutorScopeError) return;
    throw error;
  }
  const sessions = await loadSessionsForGenerationWindow(tutorId);
  const absentOccurrenceIds = buildAbsentOccurrenceIdSet(sessions);

  if (status === "PAID") {
    await markInvoicePaidInDb(
      tutorId,
      invoiceId,
      period,
      parentId,
      absentOccurrenceIds,
    );
  } else {
    const parsed = parseInvoiceId(invoiceId);
    const resolvedParentId = parsed?.parentId ?? parentId;
    const resolvedPeriod = parsed?.period ?? period;
    try {
      await assertParentInTutor(resolvedParentId, tutorId);
    } catch (error) {
      if (error instanceof TutorScopeError) return;
      throw error;
    }
    await markInvoiceUnpaidInDb(tutorId, resolvedParentId, resolvedPeriod);
  }

  revalidateAdminRoutes();
}
