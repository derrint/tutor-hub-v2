import {
  isBillableSession,
  sessionsInPeriod,
  type BillableSession,
} from "@/lib/invoices/derive-from-sessions";
import { calendarPartsFromSession } from "@/lib/invoices/session-serialization";
import type { InvoicePeriod } from "@/utils/format";
import { sessionInstantUtcMs } from "@/utils/session-clock";

/** Billable session fees in `period` whose end time has passed (WIB). */
export function computeEarnedSoFarInPeriod(
  sessions: BillableSession[],
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
  nowMs: number = Date.now(),
): number {
  const periodSessions = sessionsInPeriod(sessions, period);
  let sum = 0;

  for (const session of periodSessions) {
    if (!isBillableSession(session, period, absentOccurrenceIds)) continue;

    const parts = calendarPartsFromSession(session);
    const endMs = sessionInstantUtcMs(parts, session.endTime);
    if (endMs == null || nowMs < endMs) continue;

    sum += session.fee;
  }

  return sum;
}
