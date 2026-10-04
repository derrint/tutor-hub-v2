"use client";

import { useAttendance } from "@/context/AttendanceContext";
import {
  buildInvoiceId,
  listParentIdsWithScheduledSessions,
  resolveInvoiceForDisplay,
} from "@/lib/invoices";
import {
  INVOICES,
  MOCK_INVOICE_PERIOD,
  STUDENTS,
  type InvoicePreview,
  type InvoiceStatus,
} from "@/lib/mock-data";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "tutorhub-invoice-mock-state";

type InvoiceBodySnapshot = {
  children: InvoicePreview["children"];
  total: number;
};

type InvoiceMockState = {
  statuses: Record<string, InvoiceStatus>;
  /** Snapshotted lines when marked PAID (unpaid lines are derive-on-read). */
  bodies: Record<string, InvoiceBodySnapshot>;
  extras: InvoicePreview[];
};

const EMPTY_STATE: InvoiceMockState = {
  statuses: {},
  bodies: {},
  extras: [],
};

function readState(): InvoiceMockState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const record = parsed as Partial<InvoiceMockState>;
    return {
      statuses:
        record.statuses && typeof record.statuses === "object"
          ? (record.statuses as Record<string, InvoiceStatus>)
          : {},
      bodies:
        record.bodies && typeof record.bodies === "object"
          ? (record.bodies as Record<string, InvoiceBodySnapshot>)
          : {},
      extras: Array.isArray(record.extras)
        ? (record.extras as InvoicePreview[])
        : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

let invoiceState = readState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persist(next: InvoiceMockState) {
  invoiceState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return invoiceState;
}

const SERVER_INVOICE_SNAPSHOT: InvoiceMockState = EMPTY_STATE;

function getServerSnapshot() {
  return SERVER_INVOICE_SNAPSHOT;
}

function statesEqual(a: InvoiceMockState, b: InvoiceMockState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Persisted shell + status; UNPAID line items come from `resolveInvoiceForDisplay`. */
export function mergeInvoiceMockState(
  state: InvoiceMockState,
  seed: InvoicePreview[] = INVOICES,
): InvoicePreview[] {
  const merged = new Map<string, InvoicePreview>();

  for (const invoice of seed) {
    const body = state.bodies[invoice.id];
    merged.set(invoice.id, {
      ...invoice,
      ...(body
        ? { children: body.children, total: body.total }
        : {}),
      status: state.statuses[invoice.id] ?? invoice.status,
    });
  }

  for (const extra of state.extras) {
    const body = state.bodies[extra.id];
    merged.set(extra.id, {
      ...extra,
      ...(body
        ? { children: body.children, total: body.total }
        : {}),
      status: state.statuses[extra.id] ?? extra.status,
    });
  }

  return [...merged.values()];
}

function parentDisplayName(parentId: string): string {
  return (
    STUDENTS.find((s) => s.parentId === parentId)?.parentName ?? parentId
  );
}

type InvoiceContextValue = {
  /** Display-ready invoices (unpaid derived from schedule + attendance). */
  invoices: InvoicePreview[];
  setInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  createMissingInvoicesForPeriod: (
    period?: typeof MOCK_INVOICE_PERIOD,
  ) => number;
};

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const mockState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { absentOccurrenceIds } = useAttendance();

  useEffect(() => {
    const stored = readState();
    if (!statesEqual(stored, invoiceState)) {
      invoiceState = stored;
      emitChange();
    }
  }, []);

  const invoices = useMemo(() => {
    const merged = mergeInvoiceMockState(mockState);
    return merged.map((invoice) =>
      resolveInvoiceForDisplay(invoice, absentOccurrenceIds),
    );
  }, [mockState, absentOccurrenceIds]);

  const setInvoiceStatus = useCallback(
    (invoiceId: string, status: InvoiceStatus) => {
      const merged = mergeInvoiceMockState(invoiceState);
      const invoice = merged.find((inv) => inv.id === invoiceId);
      if (!invoice) {
        persist({
          ...invoiceState,
          statuses: { ...invoiceState.statuses, [invoiceId]: status },
        });
        return;
      }

      let bodies = invoiceState.bodies;

      if (status === "PAID") {
        const snapshot = resolveInvoiceForDisplay(
          { ...invoice, status: "UNPAID" },
          absentOccurrenceIds,
        );
        bodies = {
          ...bodies,
          [invoiceId]: {
            children: snapshot.children,
            total: snapshot.total,
          },
        };
      } else if (status === "UNPAID" && bodies[invoiceId]) {
        const nextBodies = { ...bodies };
        delete nextBodies[invoiceId];
        bodies = nextBodies;
      }

      persist({
        ...invoiceState,
        statuses: { ...invoiceState.statuses, [invoiceId]: status },
        bodies,
      });
    },
    [absentOccurrenceIds],
  );

  const createMissingInvoicesForPeriod = useCallback(
    (period = MOCK_INVOICE_PERIOD) => {
      const current = mergeInvoiceMockState(invoiceState);
      const existingParentIds = new Set(
        current
          .filter(
            (inv) =>
              inv.period.month === period.month &&
              inv.period.year === period.year,
          )
          .map((inv) => inv.parentId),
      );

      const parentIds = listParentIdsWithScheduledSessions(period);
      const newExtras: InvoicePreview[] = [...invoiceState.extras];
      let created = 0;

      for (const parentId of parentIds) {
        if (existingParentIds.has(parentId)) continue;

        const id = buildInvoiceId(parentId, period);
        if (
          INVOICES.some((inv) => inv.id === id) ||
          newExtras.some((inv) => inv.id === id)
        ) {
          continue;
        }

        newExtras.push({
          id,
          status: "UNPAID",
          parentId,
          parentName: parentDisplayName(parentId),
          period,
          children: [],
          total: 0,
        });
        existingParentIds.add(parentId);
        created += 1;
      }

      if (created > 0) {
        persist({
          ...invoiceState,
          extras: newExtras,
        });
      }

      return created;
    },
    [],
  );

  const value = useMemo(
    () => ({
      invoices,
      setInvoiceStatus,
      createMissingInvoicesForPeriod,
    }),
    [invoices, setInvoiceStatus, createMissingInvoicesForPeriod],
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
