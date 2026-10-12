import type { InvoicePeriod } from "@/utils/format";

export function buildInvoiceId(parentId: string, period: InvoicePeriod): string {
  const mm = String(period.month).padStart(2, "0");
  return `inv-${parentId}-${period.year}-${mm}`;
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
