import type { InvoicePreview } from "@/lib/mock-data";
import { STUDENTS } from "@/lib/mock-data";
import { buildStudentOccurrenceIdForPeriodDay } from "./occurrence-id";

/**
 * Drops sessions marked absent from invoice lines. Unmarked sessions stay
 * billable (default counts toward totals).
 */
export function computeBillableInvoice(
  invoice: InvoicePreview,
  absentOccurrenceIds: ReadonlySet<string>,
): InvoicePreview {
  const feeByStudent = new Map(
    STUDENTS.map((student) => [student.id, student.feePerSession]),
  );

  const children = invoice.children.map((child) => {
    const billableDays = child.sessionDays.filter(
      (day) =>
        !absentOccurrenceIds.has(
          buildStudentOccurrenceIdForPeriodDay(child.id, invoice.period, day),
        ),
    );
    const fee = feeByStudent.get(child.id) ?? 0;
    const sessionCount = billableDays.length;

    return {
      ...child,
      sessionDays: billableDays,
      sessionCount,
      subtotal: sessionCount * fee,
    };
  });

  const total = children.reduce((sum, child) => sum + child.subtotal, 0);

  return { ...invoice, children, total };
}
