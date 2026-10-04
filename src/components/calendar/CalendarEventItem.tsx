"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import { cn } from "@/utils";
import type { EventDisplayInfo } from "@fullcalendar/react";
import React, { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export interface CalendarEventItemProps {
  eventInfo: EventDisplayInfo;
}

type ScheduleEventProps = {
  startTime?: string;
  endTime?: string;
  studentId?: string;
  calendar?: string;
};

/** Avoid FullCalendar `timeText` SSR/client mismatches (locale dash, timezone). */
function getStableTimeLabel(eventInfo: EventDisplayInfo): string | null {
  const props = eventInfo.event.extendedProps as ScheduleEventProps | undefined;
  const start = props?.startTime;
  const end = props?.endTime;
  if (start && end) {
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
  }
  return null;
}

function getOccurrenceId(eventInfo: EventDisplayInfo): string | null {
  const props = eventInfo.event.extendedProps as ScheduleEventProps | undefined;
  const studentId = props?.studentId;
  const start = eventInfo.event.start;
  if (!studentId || !start) return null;
  return buildStudentOccurrenceIdFromDate(studentId, start);
}

const levelColorMap: Record<
  string,
  { bg: string; dot: string; title: string; time: string }
> = {
  success: {
    bg: "border border-success-100 bg-success-50 dark:border-success-500/20 dark:bg-success-500/15",
    dot: "bg-success-500",
    title: "text-success-700 dark:text-success-400",
    time: "text-success-600/80 dark:text-success-400/80",
  },
  danger: {
    bg: "border border-error-100 bg-error-50 dark:border-error-500/20 dark:bg-error-500/15",
    dot: "bg-error-500",
    title: "text-error-700 dark:text-error-400",
    time: "text-error-600/80 dark:text-error-400/80",
  },
  primary: {
    bg: "border border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/15",
    dot: "bg-brand-500",
    title: "text-brand-700 dark:text-brand-400",
    time: "text-brand-600/80 dark:text-brand-400/80",
  },
  warning: {
    bg: "border border-orange-100 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/15",
    dot: "bg-orange-500",
    title: "text-orange-700 dark:text-orange-400",
    time: "text-orange-600/80 dark:text-orange-400/80",
  },
};

/** Matches dashboard list — absent sessions are dimmed and de-emphasized. */
const absentColorMap = {
  bg: "border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800/80",
  dot: "bg-gray-400 dark:bg-gray-500",
  title: "text-gray-500 line-through dark:text-gray-400",
  time: "text-gray-400 dark:text-gray-500",
};

const CalendarEventItem: React.FC<CalendarEventItemProps> = ({ eventInfo }) => {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { isAbsent } = useAttendance();

  const calendarLevel = (
    eventInfo.event.extendedProps?.calendar || "primary"
  ).toLowerCase();

  const occurrenceId = getOccurrenceId(eventInfo);
  const absent = occurrenceId != null && isAbsent(occurrenceId);

  const colors = absent
    ? absentColorMap
    : (levelColorMap[calendarLevel] ?? levelColorMap.primary);

  const isTimeGridView =
    !eventInfo.event?.allDay &&
    eventInfo.view?.type &&
    eventInfo.view.type.startsWith("timeGrid");

  const stableTime = getStableTimeLabel(eventInfo);
  const timeLabel =
    stableTime ?? (isClient ? (eventInfo.timeText ?? null) : null);

  const shellClass = cn(
    "event-fc-color transition-opacity",
    absent && "opacity-60",
  );

  if (isTimeGridView) {
    return (
      <div
        dir="ltr"
        className={cn(
          shellClass,
          "flex h-full w-full flex-col justify-start overflow-hidden rounded-md p-1 sm:rounded-lg sm:p-1.5",
          colors.bg,
        )}
      >
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div
            className={cn("size-1.5 shrink-0 rounded-full sm:size-2", colors.dot)}
          />
          <div
            className={cn(
              "truncate text-[11px] font-semibold leading-tight sm:text-xs",
              colors.title,
            )}
          >
            {eventInfo.event.title || ""}
          </div>
        </div>
        {timeLabel && (
          <div
            className={cn(
              "mt-0.5 truncate ps-2.5 text-[10px] font-medium leading-tight sm:ps-3.5 sm:text-[11px]",
              colors.time,
            )}
          >
            {timeLabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className={cn(
        shellClass,
        "flex items-center rounded-md py-1 ps-1.5 pe-2 sm:rounded-lg sm:py-1.5 sm:ps-2.5 sm:pe-3",
        colors.bg,
      )}
    >
      <div
        className={cn(
          "fc-daygrid-event-dot ms-0 me-1 h-2.5 w-1 shrink-0 rounded-full border-none sm:me-2 sm:h-3.5",
          colors.dot,
        )}
      />
      {timeLabel && (
        <div
          className={cn(
            "fc-event-time me-1 p-0 text-[10px] font-normal sm:me-1.5 sm:text-xs",
            absent
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {timeLabel}
        </div>
      )}
      <div
        className={cn(
          "fc-event-title truncate p-0 text-[11px] font-medium sm:text-xs",
          absent
            ? "text-gray-500 line-through dark:text-gray-400"
            : "text-gray-700 dark:text-white",
        )}
      >
        {eventInfo.event.title || ""}
      </div>
    </div>
  );
};

export default CalendarEventItem;
