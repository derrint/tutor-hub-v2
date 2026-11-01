"use client";

import {
  setInvoiceStatusAction,
  type SetInvoiceStatusResult,
} from "@/app/actions/invoices";
import { useBillingInitial } from "@/context/BillingInitialContext";
import { useAttendance } from "@/context/AttendanceContext";
import { useRoster } from "@/context/RosterContext";
import { buildInvoiceId, parseInvoiceId } from "@/lib/invoices/invoice-id";
import {
  deriveInvoiceForParent,
  listParentIdsWithSessionsInPeriod,
} from "@/lib/invoices/derive-from-sessions";
import { hydrateSessions } from "@/lib/invoices/session-serialization";
import type { InvoicePreview, InvoiceStatus } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import { useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type InvoiceContextValue = {
  isBillingReady: boolean;
  getInvoicesForPeriod: (period: InvoicePeriod) => InvoicePreview[];
  setInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
  ) => Promise<SetInvoiceStatusResult>;
};

export const InvoiceContext = createContext<InvoiceContextValue | null>(null);

function applyInvoicePatches(
  period: InvoicePeriod,
  paidInvoices: InvoicePreview[],
  patches: Record<string, InvoicePreview>,
): InvoicePreview[] {
  const paidForPeriod = paidInvoices.filter(
    (inv) =>
      inv.period.month === period.month && inv.period.year === period.year,
  );
  const paidByParent = new Map(
    paidForPeriod.map((inv) => [inv.parentId, inv]),
  );

  for (const patch of Object.values(patches)) {
    if (
      patch.period.month !== period.month ||
      patch.period.year !== period.year
    ) {
      continue;
    }
    if (patch.status === "PAID") {
      paidByParent.set(patch.parentId, patch);
    } else {
      paidByParent.delete(patch.parentId);
    }
  }

  return [...paidByParent.values()];
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { sessions: serializedSessions, paidInvoices } = useBillingInitial();
  const sessions = useMemo(
    () => hydrateSessions(serializedSessions),
    [serializedSessions],
  );
  const { absentOccurrenceIds } = useAttendance();
  const { students, parents } = useRoster();
  const router = useRouter();
  const absentSet = absentOccurrenceIds;
  const [invoicePatches, setInvoicePatches] = useState<
    Record<string, InvoicePreview>
  >({});

  useEffect(() => {
    setInvoicePatches((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      for (const [id, patch] of Object.entries(prev)) {
        if (patch.status === "PAID") {
          const server = paidInvoices.find((inv) => inv.id === id);
          if (server?.status === "PAID") {
            delete next[id];
            changed = true;
          }
        } else {
          const serverPaid = paidInvoices.some(
            (inv) =>
              inv.id === id &&
              inv.parentId === patch.parentId &&
              inv.period.month === patch.period.month &&
              inv.period.year === patch.period.year,
          );
          if (!serverPaid) {
            delete next[id];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [paidInvoices]);

  const getInvoicesForPeriod = useCallback(
    (period: InvoicePeriod) => {
      const patchedPaid = applyInvoicePatches(
        period,
        paidInvoices,
        invoicePatches,
      );
      const paidByParent = new Map(
        patchedPaid.map((inv) => [inv.parentId, inv]),
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

        const patch = Object.values(invoicePatches).find(
          (p) =>
            p.parentId === parentId &&
            p.period.month === period.month &&
            p.period.year === period.year &&
            p.status === "UNPAID",
        );
        if (patch) {
          shells.push(patch);
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
    [
      paidInvoices,
      invoicePatches,
      students,
      sessions,
      parents,
      absentSet,
    ],
  );

  const setInvoiceStatus = useCallback(
    async (invoiceId: string, status: InvoiceStatus) => {
      const parsed = parseInvoiceId(invoiceId);
      const period = parsed?.period ?? {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };
      const parentId = parsed?.parentId ?? "";

      if (!parentId) {
        return { ok: false, reason: "invalid" } as const;
      }

      const result = await setInvoiceStatusAction(
        invoiceId,
        status,
        period,
        parentId,
      );
      if (result.ok) {
        setInvoicePatches((prev) => ({
          ...prev,
          [result.invoice.id]: result.invoice,
        }));
        router.refresh();
      }
      return result;
    },
    [router],
  );

  const value = useMemo(
    () => ({
      isBillingReady: true,
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
