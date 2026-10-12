import type {
  ParentRecord,
  StudentRecord,
  TodaySession,
  TutorProfile,
} from "@/lib/domain/types";
import type { Parent, Session, Student, Tutor } from "@prisma/client";

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

export function mapTutorProfile(tutor: Pick<
  Tutor,
  | "bankName"
  | "bankAccountNumber"
  | "accountHolderName"
  | "whatsappNumber"
>): TutorProfile {
  return {
    bankName: tutor.bankName ?? "",
    bankAccountNumber: tutor.bankAccountNumber ?? "",
    accountHolderName: tutor.accountHolderName ?? "",
    whatsappNumber: tutor.whatsappNumber ?? "",
  };
}

/** @deprecated Use `mapTutorProfile`. */
export const mapProfile = mapTutorProfile;

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
