"use client";

import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import SessionAttendanceToggle from "@/components/schedule/SessionAttendanceToggle";
import { TimeIcon } from "@/icons";
import { useAttendance } from "@/context/AttendanceContext";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import type { TodaySession } from "@/lib/mock-data";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

interface SessionListProps {
  sessions: TodaySession[];
  /** Calendar date for occurrence keys (defaults to today). */
  sessionDate?: Date;
  emptyMessage: string;
  ariaLabel: string;
}

/**
 * Today's concrete sessions. Sessions count toward billing unless explicitly
 * marked absent. No "mark attended" step — default is billable.
 */
const SessionList: React.FC<SessionListProps> = ({
  sessions,
  sessionDate,
  emptyMessage,
  ariaLabel,
}) => {
  const t = useTranslations("tutorHub.dashboard");
  const { isAbsent } = useAttendance();

  const date = useMemo(
    () => sessionDate ?? new Date(),
    [sessionDate],
  );

  const occurrenceBySessionId = useMemo(
    () =>
      new Map(
        sessions.map((session) => [
          session.id,
          buildStudentOccurrenceIdFromDate(session.studentId, date),
        ]),
      ),
    [sessions, date],
  );

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  const nextSessionId = sessions.find((session) => {
    const occurrenceId = occurrenceBySessionId.get(session.id);
    return occurrenceId && !isAbsent(occurrenceId);
  })?.id;

  return (
    <ul className="flex flex-col gap-2" aria-label={ariaLabel}>
      {sessions.map((session) => {
        const occurrenceId = occurrenceBySessionId.get(session.id)!;
        const absent = isAbsent(occurrenceId);
        const isNext = !absent && session.id === nextSessionId;

        return (
          <li
            key={session.id}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 sm:flex-nowrap sm:gap-4 dark:border-gray-800",
              isNext &&
                "border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5",
              absent && "opacity-60",
            )}
          >
            <div className="w-14 shrink-0 text-end">
              <p className="text-theme-sm font-semibold tabular-nums text-gray-800 dark:text-white/90">
                {session.startTime}
              </p>
              <p className="text-theme-xs tabular-nums text-gray-500 dark:text-gray-400">
                {session.endTime}
              </p>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {session.studentName}
              </p>
              <LevelBadge level={session.level} />
            </div>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              {absent ? (
                <StatusBadge variant="absent" />
              ) : isNext ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                  <TimeIcon className="size-3.5" />
                  {t("next")}
                </span>
              ) : (
                <StatusBadge variant="scheduled" />
              )}
              <SessionAttendanceToggle occurrenceId={occurrenceId} compact />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SessionList;
