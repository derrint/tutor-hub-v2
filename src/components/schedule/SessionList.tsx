"use client";

import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import SessionAttendanceToggle from "@/components/schedule/SessionAttendanceToggle";
import { TimeIcon } from "@/icons";
import { useAttendance } from "@/context/AttendanceContext";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import type { TodaySession } from "@/lib/mock-data";
import { cn } from "@/utils";
import {
  calendarPartsForSessionListDay,
  getSessionClockPhase,
  sessionInstantUtcMs,
  type SessionClockPhase,
} from "@/utils/session-clock";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

interface SessionListProps {
  sessions: TodaySession[];
  /** Calendar date for occurrence keys (defaults to today). */
  sessionDate?: Date;
  emptyMessage: string;
  ariaLabel: string;
}

type SessionRowMeta = {
  occurrenceId: string;
  absent: boolean;
  phase: SessionClockPhase;
  startMs: number;
};

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
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNowMs(Date.now());
    const intervalId = window.setInterval(refresh, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const date = useMemo(
    () => sessionDate ?? new Date(),
    [sessionDate],
  );

  const calendarParts = useMemo(
    () => calendarPartsForSessionListDay(sessionDate, nowMs),
    [sessionDate, nowMs],
  );

  const rowMetaBySessionId = useMemo(() => {
    const map = new Map<string, SessionRowMeta>();

    for (const session of sessions) {
      const occurrenceId = buildStudentOccurrenceIdFromDate(
        session.studentId,
        date,
      );
      const startMs =
        sessionInstantUtcMs(calendarParts, session.startTime) ?? 0;
      const endMs = sessionInstantUtcMs(calendarParts, session.endTime) ?? 0;
      const phase =
        startMs > 0 && endMs > 0
          ? getSessionClockPhase(nowMs, startMs, endMs)
          : "upcoming";

      map.set(session.id, {
        occurrenceId,
        absent: isAbsent(occurrenceId),
        phase,
        startMs,
      });
    }

    return map;
  }, [sessions, date, calendarParts, nowMs, isAbsent]);

  const nextSessionId = useMemo(() => {
    let bestId: string | undefined;
    let bestStart = Number.POSITIVE_INFINITY;

    for (const session of sessions) {
      const meta = rowMetaBySessionId.get(session.id);
      if (!meta || meta.absent || meta.phase !== "upcoming") continue;
      if (meta.startMs < bestStart) {
        bestStart = meta.startMs;
        bestId = session.id;
      }
    }

    return bestId;
  }, [sessions, rowMetaBySessionId]);

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-label={ariaLabel}>
      {sessions.map((session) => {
        const meta = rowMetaBySessionId.get(session.id)!;
        const { occurrenceId, absent, phase } = meta;
        const isNext = !absent && session.id === nextSessionId;
        const isOngoing = !absent && phase === "ongoing";
        const isDone = !absent && phase === "done";

        return (
          <li
            key={session.id}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 sm:flex-nowrap sm:gap-4 dark:border-gray-800",
              isNext &&
                "border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5",
              isOngoing &&
                "border-success-200 bg-success-50/40 dark:border-success-500/30 dark:bg-success-500/5",
              (absent || isDone) && "opacity-70",
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
              ) : phase === "done" ? (
                <StatusBadge variant="done" />
              ) : phase === "ongoing" ? (
                <StatusBadge variant="ongoing" />
              ) : isNext ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                  <TimeIcon className="size-3.5" />
                  {t("next")}
                </span>
              ) : (
                <StatusBadge variant="scheduled" />
              )}
              <SessionAttendanceToggle
                occurrenceId={occurrenceId}
                compact
                disabled={isDone}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SessionList;
