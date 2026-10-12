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
import { resolveTutorIdForRequest } from "@/lib/tutor-context/resolve-tutor-id";

export async function setInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  period: InvoicePeriod,
  parentId: string,
) {
  const tutorId = await resolveTutorIdForRequest();
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
    await markInvoiceUnpaidInDb(tutorId, resolvedParentId, resolvedPeriod);
  }

  revalidateAdminRoutes();
}
