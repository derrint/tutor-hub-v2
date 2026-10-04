"use client";

import { useAttendance } from "@/context/AttendanceContext";
import {
  computeFinanceSummary,
  type FinanceSummary,
} from "@/lib/attendance/compute-finance-summary";
import { INVOICES, type InvoicePreview } from "@/lib/mock-data";
import { useMemo } from "react";

export function useFinanceSummary(
  invoices: InvoicePreview[] = INVOICES,
): FinanceSummary {
  const { absentOccurrenceIds } = useAttendance();

  return useMemo(
    () => computeFinanceSummary(invoices, absentOccurrenceIds),
    [invoices, absentOccurrenceIds],
  );
}
