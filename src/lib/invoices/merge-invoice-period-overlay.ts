import type { InvoicePreview } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";

export function invoicePreviewMatches(
  a: InvoicePreview,
  b: InvoicePreview,
): boolean {
  return (
    a.id === b.id &&
    a.parentId === b.parentId &&
    a.status === b.status &&
    a.total === b.total &&
    a.period.month === b.period.month &&
    a.period.year === b.period.year
  );
}

export function mergeInvoiceIntoPeriodList(
  list: InvoicePreview[],
  invoice: InvoicePreview,
): InvoicePreview[] {
  const byParent = new Map(list.map((row) => [row.parentId, row]));
  byParent.set(invoice.parentId, invoice);
  return [...byParent.values()].sort((a, b) =>
    a.parentName.localeCompare(b.parentName),
  );
}

export function applyStatusPatchesToPeriodList(
  period: InvoicePeriod,
  list: InvoicePreview[],
  patches: Record<string, InvoicePreview>,
): InvoicePreview[] {
  const byParent = new Map(list.map((row) => [row.parentId, row]));

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

/** Drop optimistic patches once the server list matches them (after refetch). */
export function reconcileInvoicePatchesWithServerList(
  period: InvoicePeriod,
  serverList: InvoicePreview[],
  patches: Record<string, InvoicePreview>,
): Record<string, InvoicePreview> {
  if (Object.keys(patches).length === 0) return patches;

  const byParent = new Map(serverList.map((row) => [row.parentId, row]));
  const next = { ...patches };
  let changed = false;

  for (const [id, patch] of Object.entries(patches)) {
    if (
      patch.period.month !== period.month ||
      patch.period.year !== period.year
    ) {
      continue;
    }
    const server = byParent.get(patch.parentId);
    if (server && invoicePreviewMatches(server, patch)) {
      delete next[id];
      changed = true;
    }
  }

  return changed ? next : patches;
}
