"use client";

import { useAttendance } from "@/context/AttendanceContext";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import {
  STUDENT_CALENDAR_EVENT_COLORS,
  isStudentCalendarColorKey,
} from "@/lib/students/calendar-colors";
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

  const calendarKeyRaw = String(
    eventInfo.event.extendedProps?.calendar ?? "primary",
  ).toLowerCase();
  const calendarKey = isStudentCalendarColorKey(calendarKeyRaw)
    ? calendarKeyRaw
    : "primary";

  const occurrenceId = getOccurrenceId(eventInfo);
  const absent = occurrenceId != null && isAbsent(occurrenceId);

  const colors = absent
    ? absentColorMap
    : STUDENT_CALENDAR_EVENT_COLORS[calendarKey];

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
          "pointer-events-none flex h-full w-full flex-col justify-start overflow-hidden rounded-md p-1 sm:rounded-lg sm:p-1.5",
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
        "pointer-events-none flex items-center rounded-md py-1 ps-1.5 pe-2 sm:rounded-lg sm:py-1.5 sm:ps-2.5 sm:pe-3",
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
