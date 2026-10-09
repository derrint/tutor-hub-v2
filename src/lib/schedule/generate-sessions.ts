import {
  calendarDateToStoredDate,
  storedDateToCalendarParts,
  weekdayForCalendarDate,
} from "@/lib/datetime/calendar-date";
import { getTutorCalendarParts } from "@/lib/datetime/tutor-calendar";
import { prisma } from "@/lib/db/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

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
  const tutorToday = getTutorCalendarParts(reference);
  const refYear = tutorToday.year;
  const refMonth = tutorToday.month - 1;

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
    if (y === end.year && m === end.month && d === end.day) {
      break;
    }
    const next = new Date(Date.UTC(y, m - 1, d + 1, 12));
    y = next.getUTCFullYear();
    m = next.getUTCMonth() + 1;
    d = next.getUTCDate();
  }

  return days;
}

function addCalendarDays(date: Date, deltaDays: number): Date {
  const { year, month, day } = storedDateToCalendarParts(date);
  const next = new Date(Date.UTC(year, month - 1, day + deltaDays, 12));
  return calendarDateToStoredDate(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
  );
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

function sessionSlotKey(
  studentId: string,
  date: Date,
  startTime: string,
): string {
  return `${studentId}|${date.toISOString()}|${startTime}`;
}

export async function generateSessionsInWindow(
  window: SessionGenerationWindow,
  client: PrismaClient = prisma,
): Promise<number> {
  const rules = await client.scheduleRule.findMany({
    include: { student: true },
  });
  if (rules.length === 0) return 0;

  const existing = await client.session.findMany({
    where: {
      date: { gte: window.from, lte: window.to },
    },
    select: {
      id: true,
      studentId: true,
      date: true,
      startTime: true,
      endTime: true,
      scheduleRuleId: true,
    },
  });

  const existingByKey = new Map(
    existing.map((row) => [
      sessionSlotKey(row.studentId, row.date, row.startTime),
      row,
    ]),
  );

  const toCreate: Prisma.SessionCreateManyInput[] = [];
  const toUpdate: { id: string; scheduleRuleId: string; endTime: string }[] =
    [];

  const days = eachCalendarDayInRange(window.from, window.to);

  for (const date of days) {
    for (const rule of rules) {
      if (rule.student.status !== "ACTIVE") continue;
      if (!ruleAppliesOnDate(rule, date)) continue;

      const key = sessionSlotKey(rule.studentId, date, rule.startTime);
      const found = existingByKey.get(key);

      if (found) {
        if (
          found.scheduleRuleId !== rule.id ||
          found.endTime !== rule.endTime
        ) {
          toUpdate.push({
            id: found.id,
            scheduleRuleId: rule.id,
            endTime: rule.endTime,
          });
        }
        continue;
      }

      toCreate.push({
        studentId: rule.studentId,
        scheduleRuleId: rule.id,
        date,
        startTime: rule.startTime,
        endTime: rule.endTime,
        fee: rule.student.feePerSession,
        status: "SCHEDULED",
      });
    }
  }

  if (toCreate.length > 0) {
    await client.session.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  if (toUpdate.length > 0) {
    await client.$transaction(
      toUpdate.map((row) =>
        client.session.update({
          where: { id: row.id },
          data: {
            scheduleRuleId: row.scheduleRuleId,
            endTime: row.endTime,
          },
        }),
      ),
    );
  }

  return toCreate.length;
}

/**
 * Extends materialized sessions only when the rolling window is not yet covered.
 * Safe to call on every admin layout load (cheap no-op when up to date).
 */
export async function ensureSessionsGeneratedIfNeeded(
  client: PrismaClient = prisma,
): Promise<void> {
  const window = defaultSessionGenerationWindow();

  const ruleCount = await client.scheduleRule.count();
  if (ruleCount === 0) return;

  const agg = await client.session.aggregate({
    where: { date: { gte: window.from, lte: window.to } },
    _max: { date: true },
    _min: { date: true },
    _count: true,
  });

  if (agg._count === 0) {
    await generateSessionsInWindow(window, client);
    return;
  }

  const maxDate = agg._max.date;
  const minDate = agg._min.date;
  if (!maxDate || !minDate) return;

  const needsForward = maxDate < window.to;
  const needsBackfill = minDate > window.from;

  if (needsForward) {
    await generateSessionsInWindow(
      { from: addCalendarDays(maxDate, 1), to: window.to },
      client,
    );
  }

  if (needsBackfill) {
    await generateSessionsInWindow(
      { from: window.from, to: addCalendarDays(minDate, -1) },
      client,
    );
  }
}

/** @deprecated Prefer `ensureSessionsGeneratedIfNeeded` for layout loads. */
export async function ensureSessionsGenerated(
  client: PrismaClient = prisma,
): Promise<void> {
  await generateSessionsInWindow(defaultSessionGenerationWindow(), client);
}
