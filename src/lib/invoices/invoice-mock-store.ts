import { INVOICES, type InvoicePreview, type InvoiceStatus } from "@/lib/mock-data";

export const INVOICE_STORAGE_KEY = "tutorhub-invoice-mock-state";

export type InvoiceBodySnapshot = {
  children: InvoicePreview["children"];
  total: number;
};

export type InvoiceMockState = {
  statuses: Record<string, InvoiceStatus>;
  bodies: Record<string, InvoiceBodySnapshot>;
  extras: InvoicePreview[];
};

export const EMPTY_INVOICE_STATE: InvoiceMockState = {
  statuses: {},
  bodies: {},
  extras: [],
};

export function readInvoiceMockState(): InvoiceMockState {
  if (typeof window === "undefined") return EMPTY_INVOICE_STATE;
  try {
    const raw = window.localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return EMPTY_INVOICE_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return EMPTY_INVOICE_STATE;
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
    return EMPTY_INVOICE_STATE;
  }
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
      ...(body ? { children: body.children, total: body.total } : {}),
      status: state.statuses[invoice.id] ?? invoice.status,
    });
  }

  for (const extra of state.extras) {
    const body = state.bodies[extra.id];
    merged.set(extra.id, {
      ...extra,
      ...(body ? { children: body.children, total: body.total } : {}),
      status: state.statuses[extra.id] ?? extra.status,
    });
  }

  return [...merged.values()];
}
