"use client";

import { AdminBootstrapProvider } from "@/context/AdminBootstrapContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { RosterProvider } from "@/context/RosterContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useSidebar } from "@/context/SidebarContext";
import type { AdminBootstrapData } from "@/lib/db/load-admin-bootstrap";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminShell({
  initialData,
  children,
}: {
  initialData: AdminBootstrapData;
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "xl:ml-[290px]"
      : "xl:ml-[90px]";

  return (
    <AdminBootstrapProvider value={initialData}>
      <RosterProvider>
        <ScheduleProvider>
          <AttendanceProvider>
            <InvoiceProvider>
              <div className="min-h-screen xl:flex">
                <AppSidebar />
                <Backdrop />
                <div
                  className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
                >
                  <AppHeader />
                  <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    {children}
                  </div>
                </div>
              </div>
            </InvoiceProvider>
          </AttendanceProvider>
        </ScheduleProvider>
      </RosterProvider>
    </AdminBootstrapProvider>
  );
}
