import type { InvoiceChildLine, InvoicePreview, RecurringSession, Student } from "@/lib/mock-data";
import type { InvoicePeriod } from "@/utils/format";
import {
  MOCK_INVOICE_PERIOD,
  SEED_RECURRING_SESSIONS,
  SEED_STUDENTS,
} from "@/lib/mock-data";
import { buildStudentOccurrenceIdForPeriodDay } from "@/lib/attendance/occurrence-id";
import {
  getRosterSnapshot,
  parentDisplayName,
} from "@/lib/roster/roster-store";
import { getScheduleSnapshot } from "@/lib/schedule/schedule-store";

/** Calendar days in `period` when this student has a recurring session. */
export function getScheduledSessionDaysInPeriod(
  studentId: string,
  period: InvoicePeriod,
  recurringSessions: RecurringSession[] = getScheduleSnapshot().recurringSessions,
): number[] {
  const rules = recurringSessions.filter(
    (session) => session.studentId === studentId,
  );
  if (rules.length === 0) return [];

  const daySet = new Set<number>();
  const { year, month } = period;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekday = new Date(year, month - 1, day).getDay();
    for (const rule of rules) {
      if (rule.daysOfWeek.includes(weekday)) {
        daySet.add(day);
      }
    }
  }

  return [...daySet].sort((a, b) => a - b);
}

function buildChildLine(
  studentId: string,
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
  students: Student[],
): InvoiceChildLine | null {
  const student = students.find((s) => s.id === studentId);
  if (!student || student.status !== "ACTIVE") return null;

  const scheduledDays = getScheduledSessionDaysInPeriod(studentId, period);
  const sessionDays = scheduledDays.filter(
    (day) =>
      !absentOccurrenceIds.has(
        buildStudentOccurrenceIdForPeriodDay(studentId, period, day),
      ),
  );

  if (sessionDays.length === 0) return null;

  return {
    id: student.id,
    name: student.name,
    sessionCount: sessionDays.length,
    sessionDays,
    subtotal: sessionDays.length * student.feePerSession,
  };
}

/** One parent invoice for `period` from recurring schedule minus absences. */
export function generateInvoiceForParent(
  parentId: string,
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
  students: Student[] = getRosterSnapshot().students,
  recurringSessions: RecurringSession[] = getScheduleSnapshot().recurringSessions,
): Omit<InvoicePreview, "id" | "status"> | null {
  const studentIds = students
    .filter((s) => s.parentId === parentId && s.status === "ACTIVE")
    .map((s) => s.id);

  if (studentIds.length === 0) return null;

  const children: InvoiceChildLine[] = [];
  for (const studentId of studentIds) {
    const line = buildChildLine(
      studentId,
      period,
      absentOccurrenceIds,
      students,
    );
    if (line) children.push(line);
  }

  if (children.length === 0) return null;

  const total = children.reduce((sum, child) => sum + child.subtotal, 0);

  return {
    parentId,
    parentName: parentDisplayName(parentId),
    period,
    children,
    total,
  };
}

export function buildInvoiceId(parentId: string, period: InvoicePeriod): string {
  const mm = String(period.month).padStart(2, "0");
  return `inv-${parentId}-${period.year}-${mm}`;
}

/** Parent ids with at least one scheduled session in the period (ignoring absences). */
export function listParentIdsWithScheduledSessions(
  period: InvoicePeriod = MOCK_INVOICE_PERIOD,
  students: Student[] = getRosterSnapshot().students,
  recurringSessions: RecurringSession[] = getScheduleSnapshot().recurringSessions,
): string[] {
  const parentIds = new Set<string>();

  for (const student of students) {
    if (student.status !== "ACTIVE") continue;
    const days = getScheduledSessionDaysInPeriod(
      student.id,
      period,
      recurringSessions,
    );
    if (days.length > 0) parentIds.add(student.parentId);
  }

  return [...parentIds];
}

/** Server-safe fallback when roster store is unavailable. */
export function listParentIdsWithScheduledSessionsFromSeed(
  period: InvoicePeriod = MOCK_INVOICE_PERIOD,
): string[] {
  return listParentIdsWithScheduledSessions(
    period,
    SEED_STUDENTS,
    SEED_RECURRING_SESSIONS,
  );
}
