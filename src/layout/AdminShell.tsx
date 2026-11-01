"use client";

import { AdminInitialProvider } from "@/context/AdminInitialContext";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { RosterProvider } from "@/context/RosterContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useSidebar } from "@/context/SidebarContext";
import type { AdminInitialCoreData } from "@/lib/db/load-admin-initial-core";
import AppBottomNav from "@/layout/AppBottomNav";
import { bottomNavContentPaddingClass } from "@/layout/admin-nav-items";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import TutorDayRolloverRefresh from "@/components/admin/TutorDayRolloverRefresh";
import React from "react";

export default function AdminShell({
  initialCore,
  children,
}: {
  initialCore: AdminInitialCoreData;
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered } = useSidebar();

  const mainContentMargin =
    isExpanded || isHovered ? "xl:ms-[290px]" : "xl:ms-[90px]";

  return (
    <AdminInitialProvider value={initialCore}>
      <RosterProvider>
        <ScheduleProvider>
          <AttendanceProvider>
            <TutorDayRolloverRefresh />
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
          </AttendanceProvider>
        </ScheduleProvider>
      </RosterProvider>
    </AdminInitialProvider>
  );
}
