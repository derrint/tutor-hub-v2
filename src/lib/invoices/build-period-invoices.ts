import type { InvoicePreview, Student } from "@/lib/mock-data";
import type { InvoicePeriod } from "@/utils/format";
import { parentDisplayName } from "@/lib/roster/roster-store";
import {
  buildInvoiceId,
  listParentIdsWithScheduledSessions,
} from "./generate-invoice-from-schedule";
import {
  mergeInvoiceMockState,
  type InvoiceMockState,
} from "@/lib/invoices/invoice-mock-store";

/** Seed + persisted shells for one billing month, including virtual shells for parents with schedule. */
export function buildInvoiceShellsForPeriod(
  state: InvoiceMockState,
  period: InvoicePeriod,
  students: Student[],
): InvoicePreview[] {
  const merged = mergeInvoiceMockState(state);
  const byParentId = new Map<string, InvoicePreview>();

  for (const invoice of merged) {
    if (
      invoice.period.month === period.month &&
      invoice.period.year === period.year
    ) {
      byParentId.set(invoice.parentId, invoice);
    }
  }

  for (const parentId of listParentIdsWithScheduledSessions(period, students)) {
    if (byParentId.has(parentId)) continue;

    const id = buildInvoiceId(parentId, period);
    byParentId.set(parentId, {
      id,
      status: state.statuses[id] ?? "UNPAID",
      parentId,
      parentName: parentDisplayName(parentId),
      period,
      children: [],
      total: 0,
    });
  }

  return [...byParentId.values()].sort((a, b) =>
    a.parentName.localeCompare(b.parentName),
  );
}

/** Parse `inv-{parentId}-{year}-{mm}` (parent id may contain hyphens). */
export function parseInvoiceId(invoiceId: string): {
  parentId: string;
  period: InvoicePeriod;
} | null {
  if (!invoiceId.startsWith("inv-")) return null;
  const parts = invoiceId.split("-");
  if (parts.length < 4) return null;
  const mm = parts.pop();
  const yearStr = parts.pop();
  if (!mm || !yearStr) return null;
  const month = Number.parseInt(mm, 10);
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(month) || !Number.isFinite(year)) return null;
  const parentId = parts.slice(1).join("-");
  if (!parentId) return null;
  return { parentId, period: { month, year } };
}
