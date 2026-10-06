"use client";

import { setInvoiceStatusAction } from "@/app/actions/invoices";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useAttendance } from "@/context/AttendanceContext";
import { useRoster } from "@/context/RosterContext";
import { parseInvoiceId } from "@/lib/invoices/build-period-invoices";
import {
  deriveInvoiceForParent,
  listParentIdsWithSessionsInPeriod,
} from "@/lib/invoices/derive-from-sessions";
import type { InvoicePreview, InvoiceStatus } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import { buildInvoiceId } from "@/lib/invoices/generate-invoice-from-schedule";
import { useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

type InvoiceContextValue = {
  getInvoicesForPeriod: (period: InvoicePeriod) => InvoicePreview[];
  setInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
  ) => Promise<void>;
};

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { sessions, paidInvoices } = useAdminBootstrap();
  const { absentOccurrenceIds } = useAttendance();
  const { students, parents } = useRoster();
  const router = useRouter();
  const absentSet = absentOccurrenceIds;

  const getInvoicesForPeriod = useCallback(
    (period: InvoicePeriod) => {
      const paidForPeriod = paidInvoices.filter(
        (inv) =>
          inv.period.month === period.month && inv.period.year === period.year,
      );
      const paidByParent = new Map(
        paidForPeriod.map((inv) => [inv.parentId, inv]),
      );

      const parentIds = listParentIdsWithSessionsInPeriod(
        period,
        students,
        sessions,
      );

      const shells: InvoicePreview[] = [];

      for (const parentId of parentIds) {
        const paid = paidByParent.get(parentId);
        if (paid) {
          shells.push(paid);
          continue;
        }

        const derived = deriveInvoiceForParent(
          parentId,
          period,
          absentSet,
          students,
          sessions,
          parents,
        );
        if (!derived) continue;

        shells.push({
          ...derived,
          status: "UNPAID",
        });
      }

      return shells.sort((a, b) => a.parentName.localeCompare(b.parentName));
    },
    [paidInvoices, students, sessions, parents, absentSet],
  );

  const setInvoiceStatus = useCallback(
    async (invoiceId: string, status: InvoiceStatus) => {
      const parsed = parseInvoiceId(invoiceId);
      const period = parsed?.period ?? { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
      const parentId = parsed?.parentId ?? "";

      if (!parentId) {
        return;
      }

      await setInvoiceStatusAction(invoiceId, status, period, parentId);
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      getInvoicesForPeriod,
      setInvoiceStatus,
    }),
    [getInvoicesForPeriod, setInvoiceStatus],
  );

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoices must be used within InvoiceProvider");
  }
  return context;
}

export { buildInvoiceId };
