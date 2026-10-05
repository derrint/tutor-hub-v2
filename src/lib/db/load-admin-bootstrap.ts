import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
} from "@/lib/datetime/calendar-date";
import { mapParent, mapProfile, mapStudent, mapTodaySession } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type {
  InvoicePreview,
  ParentRecord,
  RecurringSession,
  StudentRecord,
  TodaySession,
  TutorProfile,
} from "@/lib/domain/types";
import { invoicePreviewFromPaidRecord } from "@/lib/invoices/derive-from-sessions";
import {
  buildAbsentOccurrenceIdSet,
  loadSessionsForGenerationWindow,
} from "@/lib/invoices/queries";
import { groupScheduleRulesForCalendar } from "@/lib/schedule/group-rules";
import { ensureSessionsGenerated } from "@/lib/schedule/generate-sessions";
import {
  serializeSessions,
  type SerializedSessionWithStudent,
} from "@/lib/invoices/session-serialization";

export type AdminBootstrapData = {
  profile: TutorProfile;
  parents: ParentRecord[];
  students: StudentRecord[];
  recurringSessions: RecurringSession[];
  sessions: SerializedSessionWithStudent[];
  absentOccurrenceIds: string[];
  todaySessions: TodaySession[];
  paidInvoices: InvoicePreview[];
};

export async function loadAdminBootstrap(): Promise<AdminBootstrapData> {
  await ensureSessionsGenerated();

  const [profileRow, parentsRows, studentsRows, rulesRows, sessions, paidRows] =
    await Promise.all([
      prisma.profile.findFirst(),
      prisma.parent.findMany({ orderBy: { name: "asc" } }),
      prisma.student.findMany({ orderBy: { name: "asc" } }),
      prisma.scheduleRule.findMany({
        include: { student: true },
        orderBy: [{ studentId: "asc" }, { dayOfWeek: "asc" }],
      }),
      loadSessionsForGenerationWindow(),
      prisma.invoice.findMany({
        where: { status: "PAID" },
        include: {
          parent: true,
          items: {
            include: { student: true, sessions: true },
          },
        },
      }),
    ]);

  const profile = profileRow
    ? mapProfile(profileRow)
    : {
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
      };

  const parents = parentsRows.map(mapParent);
  const students = studentsRows.map(mapStudent);
  const recurringSessions = groupScheduleRulesForCalendar(rulesRows);
  const absentOccurrenceIds = [...buildAbsentOccurrenceIdSet(sessions)];

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

  const todaySessions = sessions
    .filter((s) => s.date.getTime() === todayStart.getTime())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(mapTodaySession);

  const paidInvoices = paidRows.map(invoicePreviewFromPaidRecord);

  return {
    profile,
    parents,
    students,
    recurringSessions,
    sessions: serializeSessions(sessions),
    absentOccurrenceIds,
    todaySessions,
    paidInvoices,
  };
}
