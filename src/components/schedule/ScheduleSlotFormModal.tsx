"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRoster } from "@/context/RosterContext";
import { useSchedule } from "@/context/ScheduleContext";
import { todayIsoDateLocal } from "@/lib/datetime/calendar-date";
import type { SlotPrefill } from "@/lib/schedule/parse-slot-select";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type ScheduleSlotFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prefill: SlotPrefill | null;
};

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const ScheduleSlotFormModal: React.FC<ScheduleSlotFormModalProps> = ({
  isOpen,
  onClose,
  prefill,
}) => {
  const t = useTranslations("tutorHub.schedule");
  const tCommon = useTranslations("common");
  const { students } = useRoster();
  const { upsertRecurringSession } = useSchedule();

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "ACTIVE"),
    [students],
  );

  const [studentId, setStudentId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:00");
  const [startDate, setStartDate] = useState(() => todayIsoDateLocal());

  useEffect(() => {
    if (!isOpen) return;
    const base = prefill ?? {
      dayOfWeek: new Date().getDay(),
      startTime: "17:00",
      endTime: "18:00",
    };
    setStudentId(activeStudents[0]?.id ?? "");
    setDayOfWeek(base.dayOfWeek);
    setStartTime(base.startTime);
    setEndTime(base.endTime);
    setStartDate(todayIsoDateLocal());
  }, [isOpen, prefill, activeStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    const created = await upsertRecurringSession({
      studentId,
      daysOfWeek: [dayOfWeek],
      startTime,
      endTime,
      startDate,
    });
    if (created !== null) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {t("addSlotTitle")}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("addSlotHint")}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="slot-student">{t("fieldStudent")}</Label>
          {activeStudents.length === 0 ? (
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              {t("noActiveStudents")}
            </p>
          ) : (
            <select
              id="slot-student"
              className={selectClassName}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              {activeStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <Label htmlFor="slot-start-date">{t("fieldStartDate")}</Label>
          <Input
            id="slot-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
            {t("fieldStartDateHint")}
          </p>
        </div>

        <div>
          <Label htmlFor="slot-weekday">{t("fieldWeekday")}</Label>
          <select
            id="slot-weekday"
            className={selectClassName}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number.parseInt(e.target.value, 10))}
          >
            {WEEKDAY_KEYS.map((key, index) => (
              <option key={key} value={index}>
                {t(`weekdays.${key}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slot-start">{t("fieldStartTime")}</Label>
            <Input
              id="slot-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="slot-end">{t("fieldEndTime")}</Label>
            <Input
              id="slot-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} htmlType="button">
            {tCommon("close")}
          </Button>
          <Button
            size="sm"
            htmlType="submit"
            disabled={activeStudents.length === 0}
          >
            {tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleSlotFormModal;
