import type { AdminInitialBillingData } from "@/lib/db/load-admin-initial-billing";
import type { StudentRecord } from "@/lib/domain/types";

/**
 * Inputs that change billable session lines (not payment status — that comes
 * from `listInvoicesForPeriodAction` / `setInvoiceStatusAction`).
 */
export function invoiceListSourceFingerprint(input: {
  sessions: AdminInitialBillingData["sessions"];
  students: StudentRecord[];
  absentOccurrenceIds: ReadonlySet<string>;
}): string {
  const { sessions, students, absentOccurrenceIds } = input;

  const sessionSig =
    sessions.length === 0
      ? "s0"
      : `s${sessions.length}:${sessions[0]?.id}:${sessions.at(-1)?.id}:${sessions.reduce((sum, row) => sum + row.fee, 0)}`;

  const rosterSig = students
    .map((s) => `${s.id}:${s.feePerSession}:${s.status}:${s.parentId}`)
    .sort()
    .join("|");

  const absentSig = [...absentOccurrenceIds].sort().join("|");

  return `${sessionSig}#${rosterSig}#${absentSig}`;
}
