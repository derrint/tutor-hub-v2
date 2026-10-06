"use client";

import { AdminBootstrapProvider } from "@/context/AdminBootstrapContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { RosterProvider } from "@/context/RosterContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useSidebar } from "@/context/SidebarContext";
import type { AdminBootstrapData } from "@/lib/db/load-admin-bootstrap";
import AppBottomNav from "@/layout/AppBottomNav";
import { bottomNavContentPaddingClass } from "@/layout/admin-nav-items";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import React from "react";

export default function AdminShell({
  initialData,
  children,
}: {
  initialData: AdminBootstrapData;
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered } = useSidebar();

  const mainContentMargin =
    isExpanded || isHovered ? "xl:ms-[290px]" : "xl:ms-[90px]";

  return (
    <AdminBootstrapProvider value={initialData}>
      <RosterProvider>
        <ScheduleProvider>
          <AttendanceProvider>
            <InvoiceProvider>
              <div className="min-h-screen xl:flex">
                <AppSidebar />
                <div
                  className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
                >
                  <AppHeader />
                  <div
                    className={`mx-auto max-w-(--breakpoint-2xl) px-4 pt-4 md:px-6 md:pt-6 xl:px-6 xl:pt-6 ${bottomNavContentPaddingClass}`}
                  >
                    {children}
                  </div>
                </div>
                <AppBottomNav />
              </div>
            </InvoiceProvider>
          </AttendanceProvider>
        </ScheduleProvider>
      </RosterProvider>
    </AdminBootstrapProvider>
  );
}
