// Seed fixtures for prisma/seed.ts and development reference.
// Runtime TutorHub routes read from Postgres — see `src/lib/db/`.
// All names, phone numbers, and bank details below are fictional demo data only.

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
  studioName: "TutorHub",
  bankName: "Example Bank",
  bankAccountNumber: "1234567890",
  accountHolderName: "Demo Tutor, S.Pd",
  whatsappNumber: "",
};

export const SEED_PARENTS = [
  {
    id: "p1",
    name: "Parent One",
    salutation: "Mama Adi dan Beni",
    honorific: "Ma",
    whatsapp: "6281234567001",
  },
  {
    id: "p2",
    name: "Parent Two",
    salutation: "Pak Citra",
    honorific: "Pak",
    whatsapp: "6281234567002",
  },
  {
    id: "p3",
    name: "Parent Three",
    salutation: "Ibu Dina",
    honorific: "Bu",
    whatsapp: "6281234567003",
  },
  {
    id: "p4",
    name: "Parent Four",
    salutation: "Ibu Eko",
    honorific: "Bu",
    whatsapp: "6281234567004",
  },
  {
    id: "p5",
    name: "Parent Five",
    salutation: "Ibu Fira",
    honorific: "Bu",
    whatsapp: "6281234567005",
  },
];

export const SEED_STUDENTS = [
  {
    id: "m1",
    name: "Adi",
    age: 5,
    level: "TK" as const,
    feePerSession: 125000,
    status: "ACTIVE" as const,
    parentId: "p1",
    calendarColorKey: "primary" as StudentCalendarColorKey,
  },
  {
    id: "m2",
    name: "Beni",
    age: 6,
    level: "TK" as const,
    feePerSession: 125000,
    status: "ACTIVE" as const,
    parentId: "p1",
    calendarColorKey: "success" as StudentCalendarColorKey,
  },
  {
    id: "m3",
    name: "Citra",
    age: 3,
    level: "TK" as const,
    feePerSession: 110000,
    status: "ACTIVE" as const,
    parentId: "p2",
    calendarColorKey: "info" as StudentCalendarColorKey,
  },
  {
    id: "m4",
    name: "Dina",
    age: 5,
    level: "TK" as const,
    feePerSession: 110000,
    status: "ACTIVE" as const,
    parentId: "p3",
    calendarColorKey: "danger" as StudentCalendarColorKey,
  },
  {
    id: "m5",
    name: "Eko",
    age: 7,
    level: "SD" as const,
    feePerSession: 135000,
    status: "ACTIVE" as const,
    parentId: "p4",
    calendarColorKey: "warning" as StudentCalendarColorKey,
  },
  {
    id: "m6",
    name: "Fira",
    age: 6,
    level: "SD" as const,
    feePerSession: 135000,
    status: "INACTIVE" as const,
    parentId: "p5",
    calendarColorKey: "purple" as StudentCalendarColorKey,
  },
];

/** Seed schedule rules align with `prisma/seed.ts` rule `startDate`. */
const SEED_RULE_START_DATE = "2026-01-01";

export const SEED_RECURRING_SESSIONS = [
  {
    id: "r1",
    studentId: "m3",
    studentName: "Citra",
    level: "TK" as const,
    daysOfWeek: [1, 3, 5],
    startTime: "17:00",
    endTime: "18:00",
    startDate: SEED_RULE_START_DATE,
  },
  {
    id: "r2",
    studentId: "m4",
    studentName: "Dina",
    level: "TK" as const,
    daysOfWeek: [2, 4],
    startTime: "18:45",
    endTime: "19:45",
    startDate: SEED_RULE_START_DATE,
  },
  {
    id: "r3",
    studentId: "m1",
    studentName: "Adi",
    level: "TK" as const,
    daysOfWeek: [1, 3],
    startTime: "15:00",
    endTime: "16:00",
    startDate: SEED_RULE_START_DATE,
  },
  {
    id: "r4",
    studentId: "m2",
    studentName: "Beni",
    level: "TK" as const,
    daysOfWeek: [1, 3],
    startTime: "16:00",
    endTime: "17:00",
    startDate: SEED_RULE_START_DATE,
  },
  {
    id: "r5",
    studentId: "m5",
    studentName: "Eko",
    level: "SD" as const,
    daysOfWeek: [2, 4, 6],
    startTime: "16:00",
    endTime: "17:30",
    startDate: SEED_RULE_START_DATE,
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
