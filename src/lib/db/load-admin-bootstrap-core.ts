import { tutorTodayStoredDate } from "@/lib/datetime/tutor-calendar";
import {
  mapParent,
  mapStudent,
  mapTodaySession,
  mapTutorProfile,
} from "@/lib/db/mappers";
import { loadAbsentOccurrenceIds } from "@/lib/db/load-absent-occurrence-ids";
import { prisma } from "@/lib/db/prisma";
import type {
  ParentRecord,
  RecurringSession,
  StudentRecord,
  TodaySession,
  TutorProfile,
} from "@/lib/domain/types";
import { groupScheduleRulesForCalendar } from "@/lib/schedule/group-rules";
import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";

export type TutorCatalogEntry = {
  id: string;
  displayName: string;
};

export type TutorSessionContext = {
  activeTutorId: string | null;
  role: "TUTOR" | "ADMIN";
  tutors: TutorCatalogEntry[];
  needsTutorSelection: boolean;
};

/** Fast admin bootstrap — shell, dashboard, schedule rules (no full session window / paid invoices). */
export type AdminBootstrapCoreData = {
  profile: TutorProfile;
  parents: ParentRecord[];
  students: StudentRecord[];
  recurringSessions: RecurringSession[];
  todaySessions: TodaySession[];
  absentOccurrenceIds: string[];
  tutorContext: TutorSessionContext;
};

export async function loadAdminBootstrapCore(): Promise<AdminBootstrapCoreData> {
  const [tutorId, requestUser] = await Promise.all([
    getActiveTutorId(),
    getRequestUser(),
  ]);
  const tutors =
    requestUser?.role === "ADMIN"
      ? await prisma.tutor.findMany({
          orderBy: { displayName: "asc" },
          select: { id: true, displayName: true },
        })
      : ([] as TutorCatalogEntry[]);

  const needsTutorSelection =
    requestUser?.role === "ADMIN" && tutorId == null;

  if (!tutorId) {
    return {
      profile: {
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        whatsappNumber: "",
      },
      parents: [],
      students: [],
      recurringSessions: [],
      todaySessions: [],
      absentOccurrenceIds: [],
      tutorContext: {
        activeTutorId: null,
        role: requestUser?.role ?? "TUTOR",
        tutors,
        needsTutorSelection,
      },
    };
  }

  const todayStart = tutorTodayStoredDate();

  const [tutorRow, parentsRows, studentsRows, rulesRows, todayRows, absentOccurrenceIds] =
    await Promise.all([
      prisma.tutor.findUnique({ where: { id: tutorId } }),
      prisma.parent.findMany({
        where: { tutorId },
        orderBy: { name: "asc" },
      }),
      prisma.student.findMany({
        where: { tutorId },
        orderBy: { name: "asc" },
      }),
      prisma.scheduleRule.findMany({
        where: { student: { tutorId } },
        include: { student: true },
        orderBy: [{ studentId: "asc" }, { dayOfWeek: "asc" }],
      }),
      prisma.session.findMany({
        where: { tutorId, date: todayStart },
        include: { student: true },
        orderBy: [{ startTime: "asc" }],
      }),
      loadAbsentOccurrenceIds(tutorId),
    ]);

  const profile = tutorRow
    ? mapTutorProfile(tutorRow)
    : {
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        whatsappNumber: "",
      };

  return {
    profile,
    parents: parentsRows.map(mapParent),
    students: studentsRows.map(mapStudent),
    recurringSessions: groupScheduleRulesForCalendar(rulesRows),
    todaySessions: todayRows.map(mapTodaySession),
    absentOccurrenceIds,
    tutorContext: {
      activeTutorId: tutorId,
      role: requestUser?.role ?? "TUTOR",
      tutors,
      needsTutorSelection: false,
    },
  };
}
