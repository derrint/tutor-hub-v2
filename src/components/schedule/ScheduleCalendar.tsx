"use client";

import Calendar from "@/components/calendar/Calendar";
import type { CalendarEvent } from "@/components/calendar/types";
import LevelBadge from "@/components/common/LevelBadge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { RECURRING_SESSIONS, type RecurringSession } from "@/lib/mock-data";
import { formatDayAndMonth } from "@/utils";
import type { EventClickInfo } from "@fullcalendar/react";
import idLocale from "@fullcalendar/react/locales/id";
import { useTranslations } from "next-intl";
import { useState } from "react";

const SESSIONS_BY_ID = new Map(
  RECURRING_SESSIONS.map((session) => [session.id, session]),
);

// FullCalendar expands the weekly rule itself from daysOfWeek + startTime /
// endTime, so moving between weeks needs no date generation on our side.
const SESSION_EVENTS: CalendarEvent[] = RECURRING_SESSIONS.map((session) => ({
  id: session.id,
  title: session.studentName,
  daysOfWeek: session.daysOfWeek,
  startTime: session.startTime,
  endTime: session.endTime,
  extendedProps: { calendar: session.level === "TK" ? "Primary" : "Warning" },
}));

type SelectedOccurrence = {
  session: RecurringSession;
  date: Date | null;
};

const ScheduleCalendar: React.FC = () => {
  const t = useTranslations("tutorHub.schedule");
  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<SelectedOccurrence | null>(null);

  const handleEventClick = (info: EventClickInfo) => {
    const session = SESSIONS_BY_ID.get(info.event.id);
    if (!session) return;

    setSelected({ session, date: info.event.start ?? null });
    openModal();
  };

  return (
    <>
      <Calendar
        readOnly
        initialView="timeGridWeek"
        initialEvents={SESSION_EVENTS}
        calendarLocale={idLocale}
        slotMinTime="12:00:00"
        slotMaxTime="21:00:00"
        onEventClick={handleEventClick}
      />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-125 p-5 sm:p-6"
      >
        {selected && (
          <div>
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              {t("detailTitle")}
            </p>
            <h5 className="mt-1 flex items-center gap-2 text-theme-xl font-semibold text-gray-800 dark:text-white/90">
              {selected.session.studentName}
              <LevelBadge level={selected.session.level} />
            </h5>

            <dl className="mt-6 space-y-4">
              {selected.date && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-theme-sm text-gray-500 dark:text-gray-400">
                    {t("detailDay")}
                  </dt>
                  <dd className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDayAndMonth(selected.date)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-theme-sm text-gray-500 dark:text-gray-400">
                  {t("detailTime")}
                </dt>
                <dd className="text-theme-sm font-medium tabular-nums text-gray-800 dark:text-white/90">
                  {selected.session.startTime} – {selected.session.endTime}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-theme-xs text-gray-500 dark:text-gray-400">
              {t("detailNote")}
            </p>

            <div className="mt-6 flex justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {t("close")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ScheduleCalendar;
