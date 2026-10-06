"use client";

import Calendar from "@/components/calendar/Calendar";
import {
  CALENDAR_VIEW_OPTIONS,
  type CalendarEvent,
} from "@/components/calendar/types";
import LevelBadge from "@/components/common/LevelBadge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import SessionAttendanceToggle from "@/components/schedule/SessionAttendanceToggle";
import StatusBadge from "@/components/common/StatusBadge";
import { useAttendance } from "@/context/AttendanceContext";
import { useRoster } from "@/context/RosterContext";
import { useSchedule } from "@/context/ScheduleContext";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { resolveStudentCalendarColorKey } from "@/lib/students/calendar-colors";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import type { RecurringSession } from "@/lib/domain/types";
import { formatWeekdayLabels } from "@/lib/schedule/format-weekdays";
import { formatDayAndMonth } from "@/utils";
import type { DateSelectInfo, EventClickInfo } from "@fullcalendar/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type ScheduleCalendarProps = {
  onTimeSlotSelect?: (info: DateSelectInfo) => void;
  onEditWeeklySlot?: (
    session: RecurringSession,
    occurrenceDate: Date | null,
  ) => void;
};

type SelectedOccurrence = {
  session: RecurringSession;
  date: Date | null;
};

const editWeeklySlotButtonClassName =
  "w-full border-brand-200 text-brand-600 ring-brand-200 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:ring-brand-500/30 dark:hover:bg-brand-500/10";

const removeWeeklySlotButtonClassName =
  "w-full border-error-200 text-error-600 ring-error-200 hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:ring-error-500/30 dark:hover:bg-error-500/10";

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onTimeSlotSelect,
  onEditWeeklySlot,
}) => {
  const t = useTranslations("tutorHub.schedule");
  const tViews = useTranslations("tutorHub.schedule.views");
  const { recurringSessions, deleteRecurringSession } = useSchedule();
  const { students } = useRoster();
  const { isAbsent } = useAttendance();

  const studentColorById = useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id,
          resolveStudentCalendarColorKey(student.calendarColorKey, student.id),
        ]),
      ),
    [students],
  );

  const sessionsById = useMemo(
    () => new Map(recurringSessions.map((session) => [session.id, session])),
    [recurringSessions],
  );

  const sessionEvents: CalendarEvent[] = useMemo(
    () =>
      recurringSessions.map((session) => ({
        id: session.id,
        title: session.studentName,
        daysOfWeek: session.daysOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        startRecur: session.startDate,
        extendedProps: {
          calendar: studentColorById.get(session.studentId) ?? "primary",
          startTime: session.startTime,
          endTime: session.endTime,
          studentId: session.studentId,
        },
      })),
    [recurringSessions, studentColorById],
  );

  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<SelectedOccurrence | null>(null);

  const selectedOccurrenceId =
    selected?.date != null
      ? buildStudentOccurrenceIdFromDate(
          selected.session.studentId,
          selected.date,
        )
      : null;
  const selectedIsAbsent =
    selectedOccurrenceId != null && isAbsent(selectedOccurrenceId);

  const viewOptions = useMemo(
    () =>
      CALENDAR_VIEW_OPTIONS.map((option) => ({
        ...option,
        label: tViews(option.key),
      })),
    [tViews],
  );

  const handleEventClick = (info: EventClickInfo) => {
    const session = sessionsById.get(info.event.id);
    if (!session) return;

    setSelected({ session, date: info.event.start ?? null });
    openModal();
  };

  const handleRemoveWeeklySlot = () => {
    if (!selected) return;

    const weekdays = formatWeekdayLabels(selected.session.daysOfWeek, (key) =>
      t(`weekdays.${key}`),
    );
    const confirmed = window.confirm(
      t("removeWeeklySlotConfirm", {
        studentName: selected.session.studentName,
        weekdays,
        startTime: selected.session.startTime,
        endTime: selected.session.endTime,
      }),
    );
    if (!confirmed) return;

    void deleteRecurringSession(selected.session.id).then((ok) => {
      if (ok) {
        closeModal();
        setSelected(null);
      }
    });
  };

  const handleEditWeeklySlot = () => {
    if (!selected || !onEditWeeklySlot) return;
    onEditWeeklySlot(selected.session, selected.date);
    closeModal();
    setSelected(null);
  };

  return (
    <>
      <Calendar
        readOnly
        initialView="timeGridWeek"
        initialEvents={sessionEvents}
        slotMinTime="12:00:00"
        slotMaxTime="21:00:00"
        viewOptions={viewOptions}
        onEventClick={handleEventClick}
        onTimeSlotSelect={onTimeSlotSelect}
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
              {selectedOccurrenceId && selected.date && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-theme-sm text-gray-500 dark:text-gray-400">
                    {t("attendanceLabel")}
                  </dt>
                  <dd>
                    <StatusBadge
                      variant={selectedIsAbsent ? "absent" : "scheduled"}
                    />
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 text-theme-xs text-gray-500 dark:text-gray-400">
              {t("detailNote")}
            </p>

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
              {selectedOccurrenceId && selected.date && (
                <SessionAttendanceToggle
                  occurrenceId={selectedOccurrenceId}
                  className="w-full"
                  showIcon
                />
              )}
              {onEditWeeklySlot && (
                <Button
                  size="sm"
                  variant="outline"
                  className={editWeeklySlotButtonClassName}
                  startIcon={<PencilIcon className="size-4 shrink-0" />}
                  onClick={handleEditWeeklySlot}
                >
                  {t("editWeeklySlot")}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className={removeWeeklySlotButtonClassName}
                startIcon={<TrashBinIcon className="size-4 shrink-0" />}
                onClick={handleRemoveWeeklySlot}
                aria-label={t("removeWeeklySlotAria", {
                  studentName: selected.session.studentName,
                })}
              >
                {t("removeWeeklySlot")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ScheduleCalendar;
