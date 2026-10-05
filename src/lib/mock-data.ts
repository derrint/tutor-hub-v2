// Seed fixtures for prisma/seed.ts and development reference.
// Runtime TutorHub routes read from Postgres — see `src/lib/db/`.

import type { StudentCalendarColorKey } from "@/lib/students/calendar-colors";
import type { InvoicePeriod } from "@/utils/format";

export type {
  EducationLevel,
  InvoiceChildLine,
  InvoicePreview,
  InvoiceStatus,
  ParentRecord as MockParent,
  RecurringSession,
  SessionStatus,
  StudentRecord as Student,
  StudentStatus,
  TodaySession,
  TutorProfile,
} from "@/lib/domain/types";

import type { TutorProfile } from "@/lib/domain/types";

/** Tutor bank details for WhatsApp invoice footers (mirrors `Profile`). */
export const TUTOR_PROFILE: TutorProfile = {
  bankName: "BCA",
  bankAccountNumber: "0113164902",
  accountHolderName: "Anastasia Ceasaria Andini",
};

export const SEED_PARENTS = [
  {
    id: "p1",
    name: "Mama Askara",
    salutation: "Mama Askara dan Arga",
    honorific: "Ma",
    whatsapp: "6281234567001",
  },
  {
    id: "p2",
    name: "Michelle",
    salutation: "Michelle",
    honorific: "Ka",
    whatsapp: "6281234567002",
  },
  {
    id: "p3",
    name: "Ibu Azka",
    salutation: "Ibu Azka",
    honorific: "Bu",
    whatsapp: "6281234567003",
  },
  {
    id: "p4",
    name: "Ibu Aurell",
    salutation: "Ibu Aurell",
    honorific: "Bu",
    whatsapp: "6281234567004",
  },
  {
    id: "p5",
    name: "Ibu Milena",
    salutation: "Ibu Milena",
    honorific: "Bu",
    whatsapp: "6281234567005",
  },
];

export const SEED_STUDENTS = [
  {
    id: "m1",
    name: "Askara",
    age: 5,
    level: "TK" as const,
    feePerSession: 125000,
    status: "ACTIVE" as const,
    parentId: "p1",
    calendarColorKey: "primary" as StudentCalendarColorKey,
  },
  {
    id: "m2",
    name: "Arga",
    age: 6,
    level: "TK" as const,
    feePerSession: 125000,
    status: "ACTIVE" as const,
    parentId: "p1",
    calendarColorKey: "success" as StudentCalendarColorKey,
  },
  {
    id: "m3",
    name: "Gavendra",
    age: 3,
    level: "TK" as const,
    feePerSession: 110000,
    status: "ACTIVE" as const,
    parentId: "p2",
    calendarColorKey: "info" as StudentCalendarColorKey,
  },
  {
    id: "m4",
    name: "Azka",
    age: 5,
    level: "TK" as const,
    feePerSession: 110000,
    status: "ACTIVE" as const,
    parentId: "p3",
    calendarColorKey: "danger" as StudentCalendarColorKey,
  },
  {
    id: "m5",
    name: "Aurell",
    age: 7,
    level: "SD" as const,
    feePerSession: 135000,
    status: "ACTIVE" as const,
    parentId: "p4",
    calendarColorKey: "warning" as StudentCalendarColorKey,
  },
  {
    id: "m6",
    name: "Milena",
    age: 6,
    level: "SD" as const,
    feePerSession: 135000,
    status: "INACTIVE" as const,
    parentId: "p5",
    calendarColorKey: "purple" as StudentCalendarColorKey,
  },
];

export const SEED_RECURRING_SESSIONS = [
  {
    id: "r1",
    studentId: "m3",
    studentName: "Gavendra",
    level: "TK" as const,
    daysOfWeek: [1, 3, 5],
    startTime: "17:00",
    endTime: "18:00",
  },
  {
    id: "r2",
    studentId: "m4",
    studentName: "Azka",
    level: "TK" as const,
    daysOfWeek: [2, 4],
    startTime: "18:45",
    endTime: "19:45",
  },
  {
    id: "r3",
    studentId: "m1",
    studentName: "Askara",
    level: "TK" as const,
    daysOfWeek: [1, 3],
    startTime: "15:00",
    endTime: "16:00",
  },
  {
    id: "r4",
    studentId: "m2",
    studentName: "Arga",
    level: "TK" as const,
    daysOfWeek: [1, 3],
    startTime: "16:00",
    endTime: "17:00",
  },
  {
    id: "r5",
    studentId: "m5",
    studentName: "Aurell",
    level: "SD" as const,
    daysOfWeek: [2, 4, 6],
    startTime: "16:00",
    endTime: "17:30",
  },
];

/** @deprecated Runtime uses DB roster. */
export const PARENTS = SEED_PARENTS;
/** @deprecated Runtime uses DB roster. */
export const STUDENTS = SEED_STUDENTS;
/** @deprecated Runtime uses DB schedule. */
export const RECURRING_SESSIONS = SEED_RECURRING_SESSIONS;

export const MOCK_INVOICE_PERIOD: InvoicePeriod = { month: 9, year: 2026 };

/** @deprecated Dashboard reads today's sessions from Postgres. */
export const TODAY_SCHEDULE: import("@/lib/domain/types").TodaySession[] = [];

/** @deprecated Use invoice context + DB. */
export const INVOICES: import("@/lib/domain/types").InvoicePreview[] = [];

/** @deprecated Use finance hooks + invoice context. */
export const FINANCE_SUMMARY = {
  period: MOCK_INVOICE_PERIOD,
  totalBilled: 0,
  collected: 0,
  unpaid: 0,
};
