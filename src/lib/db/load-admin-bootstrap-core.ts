import { tutorTodayStoredDate } from "@/lib/datetime/tutor-calendar";
import { mapParent, mapProfile, mapStudent, mapTodaySession } from "@/lib/db/mappers";
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
  activeTutorId: string;
  role: "TUTOR" | "ADMIN";
  tutors: TutorCatalogEntry[];
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
  const todayStart = tutorTodayStoredDate();

  const tutorCatalogPromise =
    requestUser?.role === "ADMIN"
      ? prisma.tutor.findMany({
          orderBy: { displayName: "asc" },
          select: { id: true, displayName: true },
        })
      : Promise.resolve([] as TutorCatalogEntry[]);

  const [profileRow, parentsRows, studentsRows, rulesRows, todayRows, absentOccurrenceIds, tutors] =
    await Promise.all([
      prisma.profile.findFirst({ where: { tutorId } }),
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
      tutorCatalogPromise,
    ]);

  const profile = profileRow
    ? mapProfile(profileRow)
    : {
        studioName: "TutorHub",
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
    },
  };
}
