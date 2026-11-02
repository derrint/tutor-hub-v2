"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { useBillingInitialOptional } from "@/context/BillingInitialContext";
import { useInvoices } from "@/context/InvoiceContext";
import { useEnsureInvoicePeriodLoaded } from "@/hooks/useEnsureInvoicePeriodLoaded";
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
  /** Billing shell + server invoice list for `period` are ready to display. */
  isBillingReady: boolean;
};

export function useFinanceSummary(
  period: InvoicePeriod = getCurrentInvoicePeriod(),
): FinanceSummaryResult {
  const {
    getInvoicesForPeriod,
    isBillingReady: isBillingShellReady,
    isPeriodListReady,
  } = useInvoices();
  useEnsureInvoicePeriodLoaded(period);
  const billing = useBillingInitialOptional();
  const { absentOccurrenceIds } = useAttendance();
  const absentSet = useMemo(
    () => new Set(absentOccurrenceIds),
    [absentOccurrenceIds],
  );

  const isCurrentMonth = comparePeriodToCalendarMonth(period) === 0;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!isCurrentMonth || !isBillingShellReady) return;

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
  }, [isCurrentMonth, isBillingShellReady]);

  const sessions = useMemo(
    () => (billing ? hydrateSessions(billing.sessions) : []),
    [billing],
  );

  const invoiceListReady = isPeriodListReady(period);
  const isBillingReady = isBillingShellReady && invoiceListReady;

  return useMemo(() => {
    const invoices = isBillingReady ? getInvoicesForPeriod(period) : [];
    const earnedSoFar = isBillingShellReady
      ? computeEarnedSoFarInPeriod(sessions, period, absentSet, nowMs)
      : 0;

    return {
      ...computeFinanceSummary(invoices, period, earnedSoFar),
      isBillingReady,
    };
  }, [
    getInvoicesForPeriod,
    isBillingReady,
    isBillingShellReady,
    period,
    sessions,
    absentSet,
    nowMs,
  ]);
}
