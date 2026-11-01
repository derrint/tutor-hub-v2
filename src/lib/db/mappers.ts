import type {
  ParentRecord,
  StudentRecord,
  TodaySession,
  TutorProfile,
} from "@/lib/domain/types";
import type { Parent, Session, Student } from "@prisma/client";

/** Billing columns on `Tutor` — structural type avoids stale `@prisma/client` model exports in the IDE. */
type TutorBillingRow = {
  bankName: string | null;
  bankAccountNumber: string | null;
  accountHolderName: string | null;
  whatsappNumber: string | null;
};

export function mapParent(parent: Parent): ParentRecord {
  return {
    id: parent.id,
    name: parent.name,
    salutation: parent.salutation,
    honorific: parent.honorific,
    whatsapp: parent.whatsapp ?? "",
  };
}

export function mapStudent(student: Student): StudentRecord {
  return {
    id: student.id,
    name: student.name,
    age: student.age ?? 0,
    level: student.level,
    feePerSession: student.feePerSession,
    status: student.status,
    parentId: student.parentId ?? "",
    calendarColorKey: student.calendarColorKey as StudentRecord["calendarColorKey"],
  };
}

export function mapTutorProfile(tutor: TutorBillingRow): TutorProfile {
  return {
    bankName: tutor.bankName ?? "",
    bankAccountNumber: tutor.bankAccountNumber ?? "",
    accountHolderName: tutor.accountHolderName ?? "",
    whatsappNumber: tutor.whatsappNumber ?? "",
  };
}

export function mapTodaySession(
  session: Session & { student: Student },
): TodaySession {
  return {
    id: session.id,
    studentId: session.studentId,
    studentName: session.student.name,
    level: session.student.level,
    startTime: session.startTime,
    endTime: session.endTime,
  };
}
