import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
  weekdayForCalendarDate,
} from "@/lib/datetime/calendar-date";
import { prisma } from "@/lib/db/prisma";
import type { PrismaClient } from "@prisma/client";

/** Months before/after today to materialize recurring sessions. */
export const SESSION_GENERATION_MONTHS_BACK = 3;
export const SESSION_GENERATION_MONTHS_FORWARD = 4;

export type SessionGenerationWindow = {
  from: Date;
  to: Date;
};

export function defaultSessionGenerationWindow(
  reference: Date = new Date(),
): SessionGenerationWindow {
  const refYear = reference.getFullYear();
  const refMonth = reference.getMonth();

  const fromAnchor = new Date(
    Date.UTC(refYear, refMonth - SESSION_GENERATION_MONTHS_BACK, 1, 12),
  );
  const toAnchor = new Date(
    Date.UTC(refYear, refMonth + SESSION_GENERATION_MONTHS_FORWARD + 1, 0, 12),
  );

  const fromParts = storedDateToCalendarParts(fromAnchor);
  const toParts = storedDateToCalendarParts(toAnchor);

  return {
    from: calendarDateToStoredDate(fromParts.year, fromParts.month, 1),
    to: calendarDateToStoredDate(toParts.year, toParts.month, toParts.day),
  };
}

function eachCalendarDayInRange(from: Date, to: Date): Date[] {
  const start = storedDateToCalendarParts(from);
  const end = storedDateToCalendarParts(to);
  const days: Date[] = [];

  let y = start.year;
  let m = start.month;
  let d = start.day;

  while (true) {
    const current = calendarDateToStoredDate(y, m, d);
    days.push(current);
    if (
      y === end.year &&
      m === end.month &&
      d === end.day
    ) {
      break;
    }
    const next = new Date(Date.UTC(y, m - 1, d + 1, 12));
    y = next.getUTCFullYear();
    m = next.getUTCMonth() + 1;
    d = next.getUTCDate();
  }

  return days;
}

function ruleAppliesOnDate(
  rule: {
    dayOfWeek: number;
    startDate: Date;
    endDate: Date | null;
  },
  date: Date,
): boolean {
  const { year, month, day } = storedDateToCalendarParts(date);
  if (weekdayForCalendarDate(year, month, day) !== rule.dayOfWeek) {
    return false;
  }
  const dayStart = calendarDateToStoredDate(year, month, day);
  if (dayStart < rule.startDate) return false;
  if (rule.endDate && dayStart > rule.endDate) return false;
  return true;
}

export async function generateSessionsInWindow(
  window: SessionGenerationWindow,
  client: PrismaClient = prisma,
): Promise<number> {
  const rules = await client.scheduleRule.findMany({
    include: { student: true },
  });

  let created = 0;
  const days = eachCalendarDayInRange(window.from, window.to);

  for (const date of days) {
    for (const rule of rules) {
      if (rule.student.status !== "ACTIVE") continue;
      if (!ruleAppliesOnDate(rule, date)) continue;

      const result = await client.session.upsert({
        where: {
          studentId_date_startTime: {
            studentId: rule.studentId,
            date,
            startTime: rule.startTime,
          },
        },
        create: {
          studentId: rule.studentId,
          scheduleRuleId: rule.id,
          date,
          startTime: rule.startTime,
          endTime: rule.endTime,
          fee: rule.student.feePerSession,
          status: "SCHEDULED",
        },
        update: {
          scheduleRuleId: rule.id,
          endTime: rule.endTime,
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created += 1;
      }
    }
  }

  return created;
}

export async function ensureSessionsGenerated(
  client: PrismaClient = prisma,
): Promise<void> {
  await generateSessionsInWindow(defaultSessionGenerationWindow(), client);
}
