import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { TimeIcon } from "@/icons";
import type { TodaySession } from "@/lib/mock-data";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import React from "react";

interface SessionListProps {
  sessions: TodaySession[];
  emptyMessage: string;
  ariaLabel: string;
}

/**
 * Today's concrete sessions, shared by the dashboard card and the mobile
 * agenda on /schedule. An absent or attended session is dimmed so the day's
 * remaining work stays the thing that stands out.
 */
const SessionList: React.FC<SessionListProps> = ({
  sessions,
  emptyMessage,
  ariaLabel,
}) => {
  const t = useTranslations("tutorHub.dashboard");

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  // "Next" is the first session that hasn't happened yet — status-aware, not
  // just array position, so it stays accurate as the day progresses.
  const nextSessionId = sessions.find((s) => s.status === "SCHEDULED")?.id;

  return (
    <ul className="flex flex-col gap-2" aria-label={ariaLabel}>
      {sessions.map((session) => {
        const isNext = session.id === nextSessionId;
        const isResolved = session.status !== "SCHEDULED";

        return (
          <li
            key={session.id}
            className={cn(
              "flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-800",
              isNext && "border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5",
              isResolved && "opacity-60",
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

            <div className="flex flex-1 items-center gap-2">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {session.studentName}
              </p>
              <LevelBadge level={session.level} />
            </div>

            {isResolved ? (
              <StatusBadge
                variant={session.status === "ATTENDED" ? "attended" : "absent"}
              />
            ) : isNext ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                <TimeIcon className="size-3.5" />
                {t("next")}
              </span>
            ) : (
              <StatusBadge variant="scheduled" />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SessionList;
