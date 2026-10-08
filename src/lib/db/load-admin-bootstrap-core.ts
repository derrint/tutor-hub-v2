import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
} from "@/lib/datetime/calendar-date";
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
/** Fast admin bootstrap — shell, dashboard, schedule rules (no full session window / paid invoices). */
export type AdminBootstrapCoreData = {
  profile: TutorProfile;
  parents: ParentRecord[];
  students: StudentRecord[];
  recurringSessions: RecurringSession[];
  todaySessions: TodaySession[];
  absentOccurrenceIds: string[];
};

export async function loadAdminBootstrapCore(): Promise<AdminBootstrapCoreData> {
  const now = new Date();
  const todayParts = storedDateToCalendarParts(
    calendarDateToStoredDate(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    ),
  );
  const todayStart = calendarDateToStoredDate(
    todayParts.year,
    todayParts.month,
    todayParts.day,
  );

  const [profileRow, parentsRows, studentsRows, rulesRows, todayRows, absentOccurrenceIds] =
    await Promise.all([
      prisma.profile.findFirst(),
      prisma.parent.findMany({ orderBy: { name: "asc" } }),
      prisma.student.findMany({ orderBy: { name: "asc" } }),
      prisma.scheduleRule.findMany({
        include: { student: true },
        orderBy: [{ studentId: "asc" }, { dayOfWeek: "asc" }],
      }),
      prisma.session.findMany({
        where: { date: todayStart },
        include: { student: true },
        orderBy: [{ startTime: "asc" }],
      }),
      loadAbsentOccurrenceIds(),
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
  };
}
