"use client";

import type { AdminBootstrapBillingData } from "@/lib/db/load-admin-bootstrap-billing";
import React, { createContext, useContext, useMemo } from "react";

const BillingBootstrapContext =
  createContext<AdminBootstrapBillingData | null>(null);

export function BillingBootstrapProvider({
  value,
  children,
}: {
  value: AdminBootstrapBillingData;
  children: React.ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <BillingBootstrapContext.Provider value={memo}>
      {children}
    </BillingBootstrapContext.Provider>
  );
}

export function useBillingBootstrap(): AdminBootstrapBillingData {
  const context = useContext(BillingBootstrapContext);
  if (!context) {
    throw new Error(
      "useBillingBootstrap must be used within BillingBootstrapProvider",
    );
  }
  return context;
}

export function useBillingBootstrapOptional(): AdminBootstrapBillingData | null {
  return useContext(BillingBootstrapContext);
}
