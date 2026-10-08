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

export type AdminBootstrapBillingData = {
  sessions: SerializedSessionWithStudent[];
  paidInvoices: InvoicePreview[];
};

export async function loadAdminBootstrapBilling(): Promise<AdminBootstrapBillingData> {
  await ensureSessionsGeneratedIfNeeded();

  const [sessions, paidRows] = await Promise.all([
    loadSessionsForGenerationWindow(),
    prisma.invoice.findMany({
      where: { status: "PAID" },
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
