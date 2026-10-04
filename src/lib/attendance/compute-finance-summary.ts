import type { InvoicePreview } from "@/lib/mock-data";
import { MOCK_INVOICE_PERIOD } from "@/lib/mock-data";
import type { InvoicePeriod } from "@/utils/format";
import { computeBillableInvoice } from "./compute-invoice";

export type FinanceSummary = {
  period: InvoicePeriod;
  totalBilled: number;
  collected: number;
  unpaid: number;
  unpaidInvoiceCount: number;
  invoiceCount: number;
};

/** Aggregates billable invoice totals; respects absent sessions via `computeBillableInvoice`. */
export function computeFinanceSummary(
  invoices: InvoicePreview[],
  absentOccurrenceIds: ReadonlySet<string>,
  period: InvoicePeriod = MOCK_INVOICE_PERIOD,
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
    const billable = computeBillableInvoice(invoice, absentOccurrenceIds);
    totalBilled += billable.total;
    if (invoice.status === "PAID") {
      collected += billable.total;
    } else {
      unpaidInvoiceCount += 1;
    }
  }

  return {
    period,
    totalBilled,
    collected,
    unpaid: totalBilled - collected,
    unpaidInvoiceCount,
    invoiceCount: inPeriod.length,
  };
}
