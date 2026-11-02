"use client";

import {
  InvoiceContext,
  type InvoiceContextValue,
} from "@/context/InvoiceContext";
import { useMemo } from "react";

const pendingValue: InvoiceContextValue = {
  isBillingReady: false,
  invoicesCacheEpoch: 0,
  getInvoicesForPeriod: () => [],
  isPeriodLoading: () => false,
  loadInvoicesForPeriod: async () => {},
  setInvoiceStatus: async () => ({ ok: false, reason: "invalid" }),
};

/** Stub invoice context while billing initial load runs (dashboard / shell stay usable). */
export default function BillingPendingInvoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useMemo(() => pendingValue, []);
  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
}
