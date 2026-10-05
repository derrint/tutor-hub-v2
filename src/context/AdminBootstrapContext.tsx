"use client";

import type { AdminBootstrapData } from "@/lib/db/load-admin-bootstrap";
import React, { createContext, useContext, useMemo } from "react";

const AdminBootstrapContext = createContext<AdminBootstrapData | null>(null);

export function AdminBootstrapProvider({
  value,
  children,
}: {
  value: AdminBootstrapData;
  children: React.ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <AdminBootstrapContext.Provider value={memo}>
      {children}
    </AdminBootstrapContext.Provider>
  );
}

export function useAdminBootstrap() {
  const context = useContext(AdminBootstrapContext);
  if (!context) {
    throw new Error("useAdminBootstrap must be used within AdminBootstrapProvider");
  }
  return context;
}
