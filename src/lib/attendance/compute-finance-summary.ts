import type { InvoicePreview } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import { getCurrentInvoicePeriod } from "@/lib/billing-period";

export type FinanceSummary = {
  period: InvoicePeriod;
  totalBilled: number;
  collected: number;
  unpaid: number;
  /** Billable fees for sessions that have ended through `nowMs`. */
  earnedSoFar: number;
  /** `totalBilled - earnedSoFar`, floored at zero. */
  scheduledRemainder: number;
  unpaidInvoiceCount: number;
  invoiceCount: number;
};

/**
 * Aggregates invoice totals for a billing month. Invoices are already
 * session-derived (UNPAID) or snapshotted (PAID) from InvoiceContext.
 */
export function computeFinanceSummary(
  invoices: InvoicePreview[],
  period: InvoicePeriod = getCurrentInvoicePeriod(),
  earnedSoFar: number = 0,
): FinanceSummary {
  const inPeriod = invoices.filter(
    (invoice) =>
      invoice.period.month === period.month &&
      invoice.period.year === period.year,
  );

  let totalBilled = 0;
  let collected = 0;
  let unpaidInvoiceCount = 0;

  for (const invoice of inPeriod) {
    totalBilled += invoice.total;
    if (invoice.status === "PAID") {
      collected += invoice.total;
    } else {
      unpaidInvoiceCount += 1;
    }
  }

  return {
    period,
    totalBilled,
    collected,
    unpaid: totalBilled - collected,
    earnedSoFar,
    scheduledRemainder: Math.max(0, totalBilled - earnedSoFar),
    unpaidInvoiceCount,
    invoiceCount: inPeriod.length,
  };
}
