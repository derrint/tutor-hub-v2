import { prisma } from "@/lib/db/prisma";
import { invoicePreviewFromPaidRecord } from "@/lib/invoices/derive-from-sessions";
import {
  loadSessionsForGenerationWindow,
} from "@/lib/invoices/queries";
import {
  serializeSessions,
  type SerializedSessionWithStudent,
} from "@/lib/invoices/session-serialization";
import type { InvoicePreview } from "@/lib/domain/types";
import { ensureSessionsGeneratedIfNeeded } from "@/lib/schedule/generate-sessions";
import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";

export type AdminInitialBillingData = {
  sessions: SerializedSessionWithStudent[];
  paidInvoices: InvoicePreview[];
};

export async function loadAdminInitialBilling(): Promise<AdminInitialBillingData> {
  const tutorId = await getActiveTutorId();
  if (!tutorId) {
    return { sessions: [], paidInvoices: [] };
  }
  await ensureSessionsGeneratedIfNeeded(prisma, tutorId);

  const [sessions, paidRows] = await Promise.all([
    loadSessionsForGenerationWindow(tutorId),
    prisma.invoice.findMany({
      where: { tutorId, status: "PAID" },
      include: {
        parent: true,
        items: {
          include: { student: true, sessions: true },
        },
      },
    }),
  ]);

  return {
    sessions: serializeSessions(sessions),
    paidInvoices: paidRows.map(invoicePreviewFromPaidRecord),
  };
}
