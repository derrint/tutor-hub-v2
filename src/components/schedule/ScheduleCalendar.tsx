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
import { resolveStudentCalendarColorKey } from "@/lib/students/calendar-colors";
import { cancelSessionOccurrenceAction } from "@/app/actions/schedule";
import { buildStudentOccurrenceIdFromDate } from "@/lib/attendance";
import type { RecurringSession } from "@/lib/domain/types";
import { formatWeekdayLabels } from "@/lib/schedule/format-weekdays";
import { formatDayAndMonth } from "@/utils";
import { useRouter } from "@/i18n/navigation";
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

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onTimeSlotSelect,
  onEditWeeklySlot,
}) => {
  const t = useTranslations("tutorHub.schedule");
  const tViews = useTranslations("tutorHub.schedule.views");
  const router = useRouter();
  const { recurringSessions, deleteRecurringSession } = useSchedule();
  const { students } = useRoster();
  const { isAbsent } = useAttendance();

  const studentColorById = useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id,
          resolveStudentCalendarColorKey(
            student.calendarColorKey,
            student.id,
          ),
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
          calendar:
            studentColorById.get(session.studentId) ?? "primary",
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

  const handleCancelOccurrence = () => {
    if (!selectedOccurrenceId || !selected?.date) return;
    const confirmed = window.confirm(
      t("cancelOccurrenceConfirm", {
        studentName: selected.session.studentName,
        day: formatDayAndMonth(selected.date),
      }),
    );
    if (!confirmed) return;

    void cancelSessionOccurrenceAction(selectedOccurrenceId).then((result) => {
      if (result.ok) {
        closeModal();
        setSelected(null);
        router.refresh();
        return;
      }
      if (result.reason === "paid") {
        window.alert(t("cancelOccurrencePaidBlocked"));
      }
    });
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
            </dl>

            <p className="mt-6 text-theme-xs text-gray-500 dark:text-gray-400">
              {t("detailNote")}
            </p>

            {selectedOccurrenceId && selected.date && (
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelOccurrence}
                >
                  {t("cancelOccurrence")}
                </Button>
                <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                  {t("cancelOccurrenceHint")}
                </p>
              </div>
            )}

            {selectedOccurrenceId && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                    {t("attendanceLabel")}
                  </span>
                  <StatusBadge
                    variant={selectedIsAbsent ? "absent" : "scheduled"}
                  />
                </div>
                <SessionAttendanceToggle
                  occurrenceId={selectedOccurrenceId}
                />
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              {onEditWeeklySlot && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleEditWeeklySlot}
                >
                  {t("editWeeklySlot")}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                onClick={handleRemoveWeeklySlot}
                aria-label={t("removeWeeklySlotAria", {
                  studentName: selected.session.studentName,
                })}
              >
                {t("removeWeeklySlot")}
              </Button>
              <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                {t("removeWeeklySlotHint")}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ScheduleCalendar;
