"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { useInvoices } from "@/context/InvoiceContext";
import {
  computeFinanceSummary,
  type FinanceSummary,
} from "@/lib/attendance/compute-finance-summary";
import { useMemo } from "react";

export function useFinanceSummary(): FinanceSummary {
  const { absentOccurrenceIds } = useAttendance();
  const { invoices } = useInvoices();

  return useMemo(
    () => computeFinanceSummary(invoices, absentOccurrenceIds),
    [invoices, absentOccurrenceIds],
  );
}
