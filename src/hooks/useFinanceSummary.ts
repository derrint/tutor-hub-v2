"use client";

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
export type FinanceSummaryResult = FinanceSummary & {
  isBillingReady: boolean;
};

export function useFinanceSummary(
  period: InvoicePeriod = getCurrentInvoicePeriod(),
): FinanceSummaryResult {
  const { getInvoicesForPeriod, isBillingReady } = useInvoices();

  return useMemo(() => {
    const invoices = isBillingReady ? getInvoicesForPeriod(period) : [];
    return {
      ...computeFinanceSummary(invoices, period),
      isBillingReady,
    };
  }, [getInvoicesForPeriod, isBillingReady, period]);
}
