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
import { invoiceListSourceFingerprint } from "@/lib/invoices/billing-data-fingerprint";
import {
  applyStatusPatchesToPeriodList,
  mergeInvoiceIntoPeriodList,
  reconcileInvoicePatchesWithServerList,
} from "@/lib/invoices/merge-invoice-period-overlay";
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

export type LoadInvoicesForPeriodOptions = {
  /** Refetch without clearing UI (no month skeleton). */
  background?: boolean;
};

export type InvoiceContextValue = {
  isBillingReady: boolean;
  /** Bumps when billable inputs change — triggers background refetch. */
  invoicesCacheEpoch: number;
  getInvoicesForPeriod: (period: InvoicePeriod) => InvoicePreview[];
  isPeriodListReady: (period: InvoicePeriod) => boolean;
  isPeriodLoading: (period: InvoicePeriod) => boolean;
  loadInvoicesForPeriod: (
    period: InvoicePeriod,
    options?: LoadInvoicesForPeriodOptions,
  ) => Promise<void>;
  setInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
  ) => Promise<SetInvoiceStatusResult>;
};

export const InvoiceContext = createContext<InvoiceContextValue | null>(null);

function periodCacheKey(
  tutorId: string | null | undefined,
  period: InvoicePeriod,
): string | null {
  if (!tutorId) return null;
  return `${tutorId}:${formatBillingMonthParam(period)}`;
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { tutorContext } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const { sessions: serializedSessions, paidInvoices } = useBillingInitial();
  const { absentOccurrenceIds } = useAttendance();
  const { students } = useRoster();
  const [statusPatches, setStatusPatches] = useState<
    Record<string, InvoicePreview>
  >({});
  const [periodServerLists, setPeriodServerLists] = useState<
    Record<string, InvoicePreview[]>
  >({});
  const [periodLoadingKey, setPeriodLoadingKey] = useState<string | null>(null);
  const [invoicesCacheEpoch, setInvoicesCacheEpoch] = useState(0);
  const loadGenerationRef = useRef(0);
  const periodServerListsRef = useRef(periodServerLists);
  periodServerListsRef.current = periodServerLists;

  const listSourceFingerprint = useMemo(
    () =>
      invoiceListSourceFingerprint({
        sessions: serializedSessions,
        students,
        absentOccurrenceIds,
      }),
    [serializedSessions, students, absentOccurrenceIds],
  );

  const resetForTutorSwitch = useCallback(() => {
    loadGenerationRef.current += 1;
    setPeriodServerLists({});
    setPeriodLoadingKey(null);
    setStatusPatches({});
    setInvoicesCacheEpoch((epoch) => epoch + 1);
  }, []);

  const listFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    resetForTutorSwitch();
    listFingerprintRef.current = null;
  }, [activeTutorId, resetForTutorSwitch]);

  useEffect(() => {
    if (listFingerprintRef.current === listSourceFingerprint) {
      return;
    }
    listFingerprintRef.current = listSourceFingerprint;
    loadGenerationRef.current += 1;
    setInvoicesCacheEpoch((epoch) => epoch + 1);
  }, [listSourceFingerprint]);

  useEffect(() => {
    setStatusPatches((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      for (const [id, patch] of Object.entries(prev)) {
        if (patch.status === "PAID") {
          const server = paidInvoices.find((inv) => inv.id === id);
          if (server && server.status === "PAID") {
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
      const key = periodCacheKey(activeTutorId, period);
      if (!key || !(key in periodServerLists)) {
        return [];
      }
      return applyStatusPatchesToPeriodList(
        period,
        periodServerLists[key] ?? [],
        statusPatches,
      );
    },
    [activeTutorId, periodServerLists, statusPatches],
  );

  const isPeriodListReady = useCallback(
    (period: InvoicePeriod) => {
      const key = periodCacheKey(activeTutorId, period);
      return key !== null && key in periodServerLists;
    },
    [activeTutorId, periodServerLists],
  );

  const isPeriodLoading = useCallback(
    (period: InvoicePeriod) => {
      const key = periodCacheKey(activeTutorId, period);
      return key !== null && periodLoadingKey === key;
    },
    [activeTutorId, periodLoadingKey],
  );

  const loadInvoicesForPeriod = useCallback(
    async (
      period: InvoicePeriod,
      options?: LoadInvoicesForPeriodOptions,
    ) => {
      const key = periodCacheKey(activeTutorId, period);
      if (!key) return;

      const hasList = key in periodServerListsRef.current;
      const background = options?.background === true;

      if (hasList && !background) {
        return;
      }

      const generation = loadGenerationRef.current + 1;
      loadGenerationRef.current = generation;

      if (!hasList) {
        setPeriodLoadingKey(key);
      }

      try {
        const list = await listInvoicesForPeriodAction(period);
        if (loadGenerationRef.current !== generation) return;
        setPeriodServerLists((prev) => ({ ...prev, [key]: list }));
        setStatusPatches((prev) =>
          reconcileInvoicePatchesWithServerList(period, list, prev),
        );
      } finally {
        if (!hasList) {
          setPeriodLoadingKey((current) => (current === key ? null : current));
        }
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
        const key = periodCacheKey(activeTutorId, result.invoice.period);
        if (key) {
          setPeriodServerLists((prev) => ({
            ...prev,
            [key]: mergeInvoiceIntoPeriodList(
              prev[key] ?? [],
              result.invoice,
            ),
          }));
        }
        setStatusPatches((prev) => ({
          ...prev,
          [result.invoice.id]: result.invoice,
        }));
      }
      return result;
    },
    [activeTutorId],
  );

  const value = useMemo(
    () => ({
      isBillingReady: true,
      invoicesCacheEpoch,
      getInvoicesForPeriod,
      isPeriodListReady,
      isPeriodLoading,
      loadInvoicesForPeriod,
      setInvoiceStatus,
    }),
    [
      invoicesCacheEpoch,
      getInvoicesForPeriod,
      isPeriodListReady,
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
