"use client";

import type { AdminInitialCoreData } from "@/lib/db/load-admin-initial-core";
import React, { createContext, useContext, useMemo } from "react";

const AdminInitialContext = createContext<AdminInitialCoreData | null>(null);

export function AdminInitialProvider({
  value,
  children,
}: {
  value: AdminInitialCoreData;
  children: React.ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <AdminInitialContext.Provider value={memo}>
      {children}
    </AdminInitialContext.Provider>
  );
}

export function useAdminInitial() {
  const context = useContext(AdminInitialContext);
  if (!context) {
    throw new Error("useAdminInitial must be used within AdminInitialProvider");
  }
  return context;
}
