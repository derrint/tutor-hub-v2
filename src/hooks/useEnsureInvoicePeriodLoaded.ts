"use client";

import { useInvoices } from "@/context/InvoiceContext";
import { useAdminInitial } from "@/context/AdminInitialContext";
import { formatBillingMonthParam } from "@/lib/billing-period";
import type { InvoicePeriod } from "@/utils/format";
import { useEffect, useRef } from "react";

/** Loads server invoice list once per tutor / month / cache epoch (no refetch loops). */
export function useEnsureInvoicePeriodLoaded(period: InvoicePeriod) {
  const { tutorContext } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const {
    isBillingReady,
    invoicesCacheEpoch,
    isPeriodListReady,
    loadInvoicesForPeriod,
  } = useInvoices();
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isBillingReady) return;

    const fetchKey = `${activeTutorId ?? ""}:${formatBillingMonthParam(period)}:${invoicesCacheEpoch}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    void loadInvoicesForPeriod(period, {
      background: isPeriodListReady(period),
    });
  }, [
    activeTutorId,
    invoicesCacheEpoch,
    isBillingReady,
    loadInvoicesForPeriod,
    period.month,
    period.year,
  ]);
}
