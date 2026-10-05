import type { StudentCalendarColorKey } from "@/lib/students/calendar-colors";
import type { InvoicePeriod } from "@/utils/format";

export type EducationLevel = "TK" | "SD";
export type StudentStatus = "ACTIVE" | "INACTIVE";
export type SessionStatus = "SCHEDULED" | "ATTENDED" | "ABSENT";
export type InvoiceStatus = "UNPAID" | "PAID";

export type TutorProfile = {
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
};

export type ParentRecord = {
  id: string;
  name: string;
  salutation: string;
  honorific: string;
  whatsapp: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  age: number;
  level: EducationLevel;
  feePerSession: number;
  status: StudentStatus;
  parentId: string;
  calendarColorKey: StudentCalendarColorKey;
};

export type TodaySession = {
  id: string;
  studentId: string;
  studentName: string;
  level: EducationLevel;
  startTime: string;
  endTime: string;
};

export type RecurringSession = {
  id: string;
  studentId: string;
  studentName: string;
  level: EducationLevel;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

export type InvoiceChildLine = {
  id: string;
  name: string;
  sessionCount: number;
  subtotal: number;
  sessionDays: number[];
};

export type InvoicePreview = {
  id: string;
  parentId: string;
  parentName: string;
  period: InvoicePeriod;
  total: number;
  status: InvoiceStatus;
  children: InvoiceChildLine[];
};
