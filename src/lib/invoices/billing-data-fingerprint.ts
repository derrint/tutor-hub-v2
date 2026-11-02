import type { AdminInitialBillingData } from "@/lib/db/load-admin-initial-billing";
import type { StudentRecord } from "@/lib/domain/types";

/** Stable signature for billing + roster inputs that affect invoice lists. */
export function invoiceListSourceFingerprint(input: {
  sessions: AdminInitialBillingData["sessions"];
  paidInvoices: AdminInitialBillingData["paidInvoices"];
  students: StudentRecord[];
  absentOccurrenceIds: ReadonlySet<string>;
}): string {
  const { sessions, paidInvoices, students, absentOccurrenceIds } = input;

  const sessionSig =
    sessions.length === 0
      ? "s0"
      : `s${sessions.length}:${sessions[0]?.id}:${sessions.at(-1)?.id}:${sessions.reduce((sum, row) => sum + row.fee, 0)}`;

  const paidSig = paidInvoices
    .map((inv) => `${inv.id}:${inv.status}:${inv.total}`)
    .sort()
    .join("|");

  const rosterSig = students
    .map((s) => `${s.id}:${s.feePerSession}:${s.status}:${s.parentId}`)
    .sort()
    .join("|");

  const absentSig = [...absentOccurrenceIds].sort().join("|");

  return `${sessionSig}#${paidSig}#${rosterSig}#${absentSig}`;
}
