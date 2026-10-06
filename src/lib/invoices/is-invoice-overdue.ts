import { comparePeriodToCalendarMonth } from "@/lib/billing-period";
import type { InvoiceStatus } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";

/** UI-only: unpaid invoice for a calendar month before the current month. */
export function isInvoiceOverdue(input: {
  period: InvoicePeriod;
  status: InvoiceStatus;
  reference?: Date;
}): boolean {
  if (input.status !== "UNPAID") return false;
  return comparePeriodToCalendarMonth(input.period, input.reference) < 0;
}
