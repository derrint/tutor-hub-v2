"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { useBillingBootstrapOptional } from "@/context/BillingBootstrapContext";
import { useInvoices } from "@/context/InvoiceContext";
import { computeEarnedSoFarInPeriod } from "@/lib/attendance/compute-earned-so-far";
import {
  computeFinanceSummary,
  type FinanceSummary,
} from "@/lib/attendance/compute-finance-summary";
import {
  comparePeriodToCalendarMonth,
  getCurrentInvoicePeriod,
} from "@/lib/billing-period";
import { hydrateSessions } from "@/lib/invoices/session-serialization";
import type { InvoicePeriod } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";

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
  const billing = useBillingBootstrapOptional();
  const { absentOccurrenceIds } = useAttendance();
  const absentSet = useMemo(
    () => new Set(absentOccurrenceIds),
    [absentOccurrenceIds],
  );

  const isCurrentMonth = comparePeriodToCalendarMonth(period) === 0;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!isCurrentMonth || !isBillingReady) return;

    const refresh = () => setNowMs(Date.now());
    const intervalId = window.setInterval(refresh, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isCurrentMonth, isBillingReady]);

  const sessions = useMemo(
    () => (billing ? hydrateSessions(billing.sessions) : []),
    [billing],
  );

  return useMemo(() => {
    const invoices = isBillingReady ? getInvoicesForPeriod(period) : [];
    const earnedSoFar = isBillingReady
      ? computeEarnedSoFarInPeriod(sessions, period, absentSet, nowMs)
      : 0;

    return {
      ...computeFinanceSummary(invoices, period, earnedSoFar),
      isBillingReady,
    };
  }, [
    getInvoicesForPeriod,
    isBillingReady,
    period,
    sessions,
    absentSet,
    nowMs,
  ]);
}
