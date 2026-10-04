"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { useRoster } from "@/context/RosterContext";
import { useSchedule } from "@/context/ScheduleContext";
import {
  buildInvoiceShellsForPeriod,
  parseInvoiceId,
} from "@/lib/invoices/build-period-invoices";
import {
  EMPTY_INVOICE_STATE,
  INVOICE_STORAGE_KEY,
  mergeInvoiceMockState,
  readInvoiceMockState,
  type InvoiceMockState,
} from "@/lib/invoices/invoice-mock-store";
import { resolveInvoiceForDisplay } from "@/lib/invoices";
import { parentDisplayName } from "@/lib/roster/roster-store";
import type { InvoicePreview, InvoiceStatus } from "@/lib/mock-data";
import type { InvoicePeriod } from "@/utils/format";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

let invoiceState = readInvoiceMockState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persist(next: InvoiceMockState) {
  invoiceState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(next));
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

function getServerSnapshot() {
  return EMPTY_INVOICE_STATE;
}

function statesEqual(a: InvoiceMockState, b: InvoiceMockState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type InvoiceContextValue = {
  getInvoicesForPeriod: (period: InvoicePeriod) => InvoicePreview[];
  setInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
};

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const mockState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { absentOccurrenceIds } = useAttendance();
  const { students } = useRoster();
  const { recurringSessions } = useSchedule();

  useEffect(() => {
    const stored = readInvoiceMockState();
    if (!statesEqual(stored, invoiceState)) {
      invoiceState = stored;
      emitChange();
    }
  }, []);

  const getInvoicesForPeriod = useCallback(
    (period: InvoicePeriod) => {
      const shells = buildInvoiceShellsForPeriod(
        mockState,
        period,
        students,
        recurringSessions,
      );
      return shells.map((invoice) =>
        resolveInvoiceForDisplay(
          invoice,
          absentOccurrenceIds,
          students,
          recurringSessions,
        ),
      );
    },
    [mockState, absentOccurrenceIds, students, recurringSessions],
  );

  const setInvoiceStatus = useCallback(
    (invoiceId: string, status: InvoiceStatus) => {
      const merged = mergeInvoiceMockState(invoiceState);
      let invoice = merged.find((inv) => inv.id === invoiceId);

      if (!invoice) {
        const parsed = parseInvoiceId(invoiceId);
        if (!parsed) {
          persist({
            ...invoiceState,
            statuses: { ...invoiceState.statuses, [invoiceId]: status },
          });
          return;
        }
        invoice = {
          id: invoiceId,
          status: "UNPAID",
          parentId: parsed.parentId,
          parentName: parentDisplayName(parsed.parentId),
          period: parsed.period,
          children: [],
          total: 0,
        };
      }

      let extras = invoiceState.extras;
      if (!merged.some((inv) => inv.id === invoiceId)) {
        extras = [...invoiceState.extras, invoice];
      }

      let bodies = invoiceState.bodies;

      if (status === "PAID") {
        const snapshot = resolveInvoiceForDisplay(
          { ...invoice, status: "UNPAID" },
          absentOccurrenceIds,
          students,
          recurringSessions,
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
        extras,
        statuses: { ...invoiceState.statuses, [invoiceId]: status },
        bodies,
      });
    },
    [absentOccurrenceIds, students, recurringSessions],
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

/** @deprecated Import from `@/lib/invoices/invoice-mock-store`. */
export { mergeInvoiceMockState } from "@/lib/invoices/invoice-mock-store";
