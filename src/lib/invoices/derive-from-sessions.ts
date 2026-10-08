import { buildStudentOccurrenceIdForPeriodDay } from "@/lib/attendance/occurrence-id";
import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
} from "@/lib/datetime/calendar-date";
import type {
  InvoiceChildLine,
  InvoicePreview,
  StudentRecord,
} from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import type { Session, Student } from "@prisma/client";
import {
  calendarPartsFromSession,
  sessionStoredDate,
  type SerializedSessionWithStudent,
} from "@/lib/invoices/session-serialization";
import { buildInvoiceId } from "./generate-invoice-from-schedule";

export type SessionWithStudent = Session & { student: Student };

export type BillableSession = SessionWithStudent | SerializedSessionWithStudent;

export function sessionsInPeriod(
  sessions: BillableSession[],
  period: InvoicePeriod,
): BillableSession[] {
  const from = calendarDateToStoredDate(period.year, period.month, 1);
  const lastDay = new Date(
    Date.UTC(period.year, period.month, 0, 12),
  ).getUTCDate();
  const to = calendarDateToStoredDate(period.year, period.month, lastDay);

  return sessions.filter((s) => {
    const date = sessionStoredDate(s);
    return date >= from && date <= to;
  });
}

export function isBillableSession(
  session: BillableSession,
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
): boolean {
  if (session.status === "ABSENT") return false;
  const { day } = calendarPartsFromSession(session);
  const occurrenceId = buildStudentOccurrenceIdForPeriodDay(
    session.studentId,
    period,
    day,
  );
  if (absentOccurrenceIds.has(occurrenceId)) return false;
  return true;
}

function buildChildLineFromSessions(
  student: StudentRecord,
  period: InvoicePeriod,
  sessions: BillableSession[],
  absentOccurrenceIds: ReadonlySet<string>,
): InvoiceChildLine | null {
  if (student.status !== "ACTIVE") return null;

  const studentSessions = sessions.filter(
    (s) => s.studentId === student.id && isBillableSession(s, period, absentOccurrenceIds),
  );
  if (studentSessions.length === 0) return null;

  const sessionDays = studentSessions
    .map((s) => calendarPartsFromSession(s).day)
    .sort((a, b) => a - b);

  const subtotal = studentSessions.reduce((sum, s) => sum + s.fee, 0);

  return {
    id: student.id,
    name: student.name,
    sessionCount: studentSessions.length,
    sessionDays,
    subtotal,
  };
}

export function parentDisplayNameFromRecords(
  parentId: string,
  parents: { id: string; name: string; salutation: string }[],
): string {
  const parent = parents.find((p) => p.id === parentId);
  return parent?.name ?? parent?.salutation ?? parentId;
}

export function deriveInvoiceForParent(
  parentId: string,
  period: InvoicePeriod,
  absentOccurrenceIds: ReadonlySet<string>,
  students: StudentRecord[],
  sessions: BillableSession[],
  parents: { id: string; name: string; salutation: string }[],
): Omit<InvoicePreview, "status"> | null {
  const periodSessions = sessionsInPeriod(sessions, period);
  const studentIds = students
    .filter((s) => s.parentId === parentId && s.status === "ACTIVE")
    .map((s) => s.id);

  if (studentIds.length === 0) return null;

  const children: InvoiceChildLine[] = [];
  for (const studentId of studentIds) {
    const student = students.find((s) => s.id === studentId);
    if (!student) continue;
    const line = buildChildLineFromSessions(
      student,
      period,
      periodSessions,
      absentOccurrenceIds,
    );
    if (line) children.push(line);
  }

  if (children.length === 0) return null;

  const total = children.reduce((sum, c) => sum + c.subtotal, 0);

  return {
    id: buildInvoiceId(parentId, period),
    parentId,
    parentName: parentDisplayNameFromRecords(parentId, parents),
    period,
    children,
    total,
  };
}

export function listParentIdsWithSessionsInPeriod(
  period: InvoicePeriod,
  students: StudentRecord[],
  sessions: BillableSession[],
): string[] {
  const periodSessions = sessionsInPeriod(sessions, period);
  const parentIds = new Set<string>();

  for (const student of students) {
    if (student.status !== "ACTIVE") continue;
    if (periodSessions.some((s) => s.studentId === student.id)) {
      parentIds.add(student.parentId);
    }
  }

  return [...parentIds];
}

export function invoicePreviewFromPaidRecord(
  invoice: {
    id: string;
    parentId: string;
    month: number;
    year: number;
    status: "UNPAID" | "PAID";
    parent: { name: string; salutation: string };
    items: {
      studentId: string;
      sessionCount: number;
      subtotal: number;
      student: { name: string };
      sessions: { date: Date }[];
    }[];
  },
): InvoicePreview {
  const period = { month: invoice.month, year: invoice.year };
  const children: InvoiceChildLine[] = invoice.items.map((item) => ({
    id: item.studentId,
    name: item.student.name,
    sessionCount: item.sessionCount,
    subtotal: item.subtotal,
    sessionDays: item.sessions
      .map((s) => storedDateToCalendarParts(s.date).day)
      .sort((a, b) => a - b),
  }));

  const total = children.reduce((sum, c) => sum + c.subtotal, 0);

  return {
    id: invoice.id,
    parentId: invoice.parentId,
    parentName:
      invoice.parent.name ?? invoice.parent.salutation ?? invoice.parentId,
    period,
    status: invoice.status,
    children,
    total,
  };
}
