import type { DateClickInfo, DateSelectInfo } from "@fullcalendar/react";

export type SlotPrefill = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  /** Existing grouped rule id when editing. */
  ruleId?: string;
  studentId?: string;
  startDate?: string;
  /** Legacy prefill; prefer `dayOfWeek`. */
  daysOfWeek?: number[];
};

const DEFAULT_SLOT: SlotPrefill = {
  dayOfWeek: new Date().getDay(),
  startTime: "17:00",
  endTime: "18:00",
};

function formatTime24(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Single tap on a time-grid cell (mobile-friendly; no drag/long-press). */
export function slotPrefillFromDateClick(info: DateClickInfo): SlotPrefill {
  const start = info.date;
  if (!start) return DEFAULT_SLOT;

  const dayOfWeek = start.getDay();

  if (info.allDay) {
    return { dayOfWeek, startTime: "17:00", endTime: "18:00" };
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    dayOfWeek,
    startTime: formatTime24(start),
    endTime: formatTime24(end),
  };
}

/** Map FullCalendar slot selection to weekly rule defaults. */
export function slotPrefillFromDateSelect(
  info: DateSelectInfo,
): SlotPrefill {
  const start = info.start;
  if (!start) return DEFAULT_SLOT;

  const dayOfWeek = start.getDay();

  if (info.allDay) {
    return { dayOfWeek, startTime: "17:00", endTime: "18:00" };
  }

  const end = info.end ?? new Date(start.getTime() + 60 * 60 * 1000);
  let endTime = formatTime24(end);

  if (end.getTime() <= start.getTime()) {
    endTime = formatTime24(new Date(start.getTime() + 60 * 60 * 1000));
  }

  return {
    dayOfWeek,
    startTime: formatTime24(start),
    endTime,
  };
}

export function defaultSlotPrefill(): SlotPrefill {
  return { ...DEFAULT_SLOT, dayOfWeek: new Date().getDay() };
}
