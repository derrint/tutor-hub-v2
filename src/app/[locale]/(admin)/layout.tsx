"use client";

import { AttendanceProvider } from "@/context/AttendanceContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { RosterProvider } from "@/context/RosterContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Reserve sidebar width only from `xl` up — below that the drawer is off-canvas
  // (see AppSidebar translate) so `lg:` margin would leave an empty gutter.
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "xl:ml-[290px]"
      : "xl:ml-[90px]";

  return (
    <RosterProvider>
    <ScheduleProvider>
    <AttendanceProvider>
      <InvoiceProvider>
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
      </InvoiceProvider>
    </AttendanceProvider>
    </ScheduleProvider>
    </RosterProvider>
  );
}
