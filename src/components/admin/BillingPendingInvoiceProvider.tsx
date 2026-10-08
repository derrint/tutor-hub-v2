"use client";

import {
  InvoiceContext,
  type InvoiceContextValue,
} from "@/context/InvoiceContext";
import { useMemo } from "react";

const pendingValue: InvoiceContextValue = {
  isBillingReady: false,
  getInvoicesForPeriod: () => [],
  setInvoiceStatus: async () => {},
};

/** Stub invoice context while billing bootstrap loads (dashboard / shell stay usable). */
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
