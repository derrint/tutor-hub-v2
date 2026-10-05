import { storedDateToCalendarParts } from "@/lib/datetime/calendar-date";
import type { SessionWithStudent } from "@/lib/invoices/derive-from-sessions";
import type { SessionStatus } from "@/lib/domain/types";
import type { Student } from "@prisma/client";

export type SerializedSessionWithStudent = {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  fee: number;
  student: Pick<Student, "id" | "name" | "level" | "parentId" | "status">;
};

export function serializeSessions(
  sessions: SessionWithStudent[],
): SerializedSessionWithStudent[] {
  return sessions.map((session) => ({
    id: session.id,
    studentId: session.studentId,
    date: session.date.toISOString(),
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    fee: session.fee,
    student: {
      id: session.student.id,
      name: session.student.name,
      level: session.student.level,
      parentId: session.student.parentId,
      status: session.student.status,
    },
  }));
}

export function hydrateSessions(
  sessions: SerializedSessionWithStudent[],
): SessionWithStudent[] {
  return sessions.map((session) => ({
    id: session.id,
    studentId: session.studentId,
    date: new Date(session.date),
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    fee: session.fee,
    scheduleRuleId: null,
    invoiceItemId: null,
    notes: null,
    createdAt: new Date(session.date),
    updatedAt: new Date(session.date),
    student: {
      id: session.student.id,
      name: session.student.name,
      level: session.student.level,
      parentId: session.student.parentId,
      status: session.student.status,
      age: null,
      feePerSession: session.fee,
      calendarColorKey: "primary",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }));
}

export function sessionStoredDate(session: { date: Date | string }): Date {
  return typeof session.date === "string" ? new Date(session.date) : session.date;
}

export function calendarPartsFromSession(session: { date: Date | string }) {
  return storedDateToCalendarParts(sessionStoredDate(session));
}
