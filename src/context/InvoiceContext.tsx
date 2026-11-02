"use client";

import {
  listInvoicesForPeriodAction,
  setInvoiceStatusAction,
  type SetInvoiceStatusResult,
} from "@/app/actions/invoices";
import { useAdminInitial } from "@/context/AdminInitialContext";
import { useBillingInitial } from "@/context/BillingInitialContext";
import { useAttendance } from "@/context/AttendanceContext";
import { useRoster } from "@/context/RosterContext";
import { formatBillingMonthParam } from "@/lib/billing-period";
import { buildInvoiceId, parseInvoiceId } from "@/lib/invoices/invoice-id";
import {
  deriveInvoiceForParent,
  listParentIdsWithSessionsInPeriod,
} from "@/lib/invoices/derive-from-sessions";
import { invoiceListSourceFingerprint } from "@/lib/invoices/billing-data-fingerprint";
import { hydrateSessions } from "@/lib/invoices/session-serialization";
import type { InvoicePreview, InvoiceStatus } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type InvoiceContextValue = {
  isBillingReady: boolean;
  /** Bumps when cached month lists are cleared (billing/roster/attendance changed). */
  invoicesCacheEpoch: number;
  getInvoicesForPeriod: (period: InvoicePeriod) => InvoicePreview[];
  isPeriodLoading: (period: InvoicePeriod) => boolean;
  loadInvoicesForPeriod: (period: InvoicePeriod) => Promise<void>;
  setInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
  ) => Promise<SetInvoiceStatusResult>;
};

export const InvoiceContext = createContext<InvoiceContextValue | null>(null);

function applyPatchesToPeriodInvoices(
  period: InvoicePeriod,
  invoices: InvoicePreview[],
  patches: Record<string, InvoicePreview>,
): InvoicePreview[] {
  const byParent = new Map(invoices.map((inv) => [inv.parentId, inv]));

  for (const patch of Object.values(patches)) {
    if (
      patch.period.month !== period.month ||
      patch.period.year !== period.year
    ) {
      continue;
    }
    byParent.set(patch.parentId, patch);
  }

  return [...byParent.values()].sort((a, b) =>
    a.parentName.localeCompare(b.parentName),
  );
}

function applyInvoicePatchesToPaidList(
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

function periodCacheKey(
  tutorId: string | null | undefined,
  period: InvoicePeriod,
): string | null {
  if (!tutorId) return null;
  return `${tutorId}:${formatBillingMonthParam(period)}`;
}

function mergeInvoiceIntoPeriodCache(
  cache: InvoicePreview[],
  invoice: InvoicePreview,
): InvoicePreview[] {
  const byParent = new Map(cache.map((inv) => [inv.parentId, inv]));
  byParent.set(invoice.parentId, invoice);
  return [...byParent.values()].sort((a, b) =>
    a.parentName.localeCompare(b.parentName),
  );
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { tutorContext } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const { sessions: serializedSessions, paidInvoices } = useBillingInitial();
  const sessions = useMemo(
    () => hydrateSessions(serializedSessions),
    [serializedSessions],
  );
  const { absentOccurrenceIds } = useAttendance();
  const { students, parents } = useRoster();
  const absentSet = absentOccurrenceIds;
  const [invoicePatches, setInvoicePatches] = useState<
    Record<string, InvoicePreview>
  >({});
  const [periodCache, setPeriodCache] = useState<
    Record<string, InvoicePreview[]>
  >({});
  const [periodLoadingKey, setPeriodLoadingKey] = useState<string | null>(null);
  const [invoicesCacheEpoch, setInvoicesCacheEpoch] = useState(0);
  const loadGenerationRef = useRef(0);
  const periodCacheRef = useRef(periodCache);
  periodCacheRef.current = periodCache;

  const listSourceFingerprint = useMemo(
    () =>
      invoiceListSourceFingerprint({
        sessions: serializedSessions,
        paidInvoices,
        students,
        absentOccurrenceIds: absentSet,
      }),
    [serializedSessions, paidInvoices, students, absentSet],
  );

  const clearPeriodCache = useCallback(() => {
    loadGenerationRef.current += 1;
    setPeriodCache({});
    setPeriodLoadingKey(null);
    setInvoicesCacheEpoch((epoch) => epoch + 1);
  }, []);

  useEffect(() => {
    setInvoicePatches({});
  }, [activeTutorId]);

  useEffect(() => {
    clearPeriodCache();
  }, [activeTutorId, listSourceFingerprint, clearPeriodCache]);

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

  const deriveInvoicesClientSide = useCallback(
    (period: InvoicePeriod): InvoicePreview[] => {
      const patchedPaid = applyInvoicePatchesToPaidList(
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

  const getInvoicesForPeriod = useCallback(
    (period: InvoicePeriod) => {
      const key = periodCacheKey(activeTutorId, period);
      if (key && key in periodCache) {
        return applyPatchesToPeriodInvoices(
          period,
          periodCache[key] ?? [],
          invoicePatches,
        );
      }
      return deriveInvoicesClientSide(period);
    },
    [activeTutorId, periodCache, invoicePatches, deriveInvoicesClientSide],
  );

  const isPeriodLoading = useCallback(
    (period: InvoicePeriod) => {
      const key = periodCacheKey(activeTutorId, period);
      return key !== null && periodLoadingKey === key;
    },
    [activeTutorId, periodLoadingKey],
  );

  const loadInvoicesForPeriod = useCallback(
    async (period: InvoicePeriod) => {
      const key = periodCacheKey(activeTutorId, period);
      if (!key) return;
      if (key in periodCacheRef.current) {
        return;
      }

      const generation = loadGenerationRef.current + 1;
      loadGenerationRef.current = generation;
      setPeriodLoadingKey(key);
      try {
        const list = await listInvoicesForPeriodAction(period);
        if (loadGenerationRef.current !== generation) return;
        setPeriodCache((prev) => ({ ...prev, [key]: list }));
      } finally {
        setPeriodLoadingKey((current) => (current === key ? null : current));
      }
    },
    [activeTutorId],
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
        const key = periodCacheKey(activeTutorId, result.invoice.period);
        if (key) {
          setPeriodCache((prev) => ({
            ...prev,
            [key]: mergeInvoiceIntoPeriodCache(
              prev[key] ?? deriveInvoicesClientSide(result.invoice.period),
              result.invoice,
            ),
          }));
        }
      }
      return result;
    },
    [activeTutorId, deriveInvoicesClientSide],
  );

  const value = useMemo(
    () => ({
      isBillingReady: true,
      invoicesCacheEpoch,
      getInvoicesForPeriod,
      isPeriodLoading,
      loadInvoicesForPeriod,
      setInvoiceStatus,
    }),
    [
      invoicesCacheEpoch,
      getInvoicesForPeriod,
      isPeriodLoading,
      loadInvoicesForPeriod,
      setInvoiceStatus,
    ],
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
