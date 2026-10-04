"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { useInvoices } from "@/context/InvoiceContext";
import {
  computeFinanceSummary,
  type FinanceSummary,
} from "@/lib/attendance/compute-finance-summary";
import type { InvoicePeriod } from "@/utils/format";
import { getCurrentInvoicePeriod } from "@/lib/billing-period";
import { useMemo } from "react";

/**
 * @param period — Billing month to aggregate. Dashboard passes calendar month;
 * Finance page passes URL billing month via `useBillingPeriod`.
 */
export function useFinanceSummary(
  period: InvoicePeriod = getCurrentInvoicePeriod(),
): FinanceSummary {
  const { absentOccurrenceIds } = useAttendance();
  const { invoices } = useInvoices();

  return useMemo(
    () => computeFinanceSummary(invoices, absentOccurrenceIds, period),
    [invoices, absentOccurrenceIds, period],
  );
}
