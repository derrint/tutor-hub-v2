"use client";

import type { AdminInitialBillingData } from "@/lib/db/load-admin-initial-billing";
import React, { createContext, useContext, useMemo } from "react";

const BillingInitialContext = createContext<AdminInitialBillingData | null>(
  null,
);

export function BillingInitialProvider({
  value,
  children,
}: {
  value: AdminInitialBillingData;
  children: React.ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <BillingInitialContext.Provider value={memo}>
      {children}
    </BillingInitialContext.Provider>
  );
}

export function useBillingInitial(): AdminInitialBillingData {
  const context = useContext(BillingInitialContext);
  if (!context) {
    throw new Error(
      "useBillingInitial must be used within BillingInitialProvider",
    );
  }
  return context;
}

export function useBillingInitialOptional(): AdminInitialBillingData | null {
  return useContext(BillingInitialContext);
}
