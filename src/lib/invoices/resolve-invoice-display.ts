import type { InvoicePreview, RecurringSession, Student } from "@/lib/mock-data";
import { generateInvoiceForParent } from "./generate-invoice-from-schedule";

/**
 * UNPAID: lines from recurring schedule minus absences (live, no stored body).
 * PAID: stored lines from merge/snapshot — not re-derived from schedule.
 */
export function resolveInvoiceForDisplay(
  invoice: InvoicePreview,
  absentOccurrenceIds: ReadonlySet<string>,
  students?: Student[],
  recurringSessions?: RecurringSession[],
): InvoicePreview {
  if (invoice.status === "PAID") {
    return invoice;
  }

  const derived = generateInvoiceForParent(
    invoice.parentId,
    invoice.period,
    absentOccurrenceIds,
    students,
    recurringSessions,
  );

  if (!derived) {
    return { ...invoice, children: [], total: 0 };
  }

  return {
    ...invoice,
    parentName: derived.parentName,
    children: derived.children,
    total: derived.total,
  };
}

/** Finance totals — same rules as display (paid uses snapshotted/stored lines). */
export function resolveInvoiceForBilling(
  invoice: InvoicePreview,
  absentOccurrenceIds: ReadonlySet<string>,
  students?: Student[],
  recurringSessions?: RecurringSession[],
): InvoicePreview {
  return resolveInvoiceForDisplay(
    invoice,
    absentOccurrenceIds,
    students,
    recurringSessions,
  );
}
