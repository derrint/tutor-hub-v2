"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRoster } from "@/context/RosterContext";
import { useSchedule } from "@/context/ScheduleContext";
import { todayIsoDateLocal } from "@/lib/datetime/calendar-date";
import type { SlotPrefill } from "@/lib/schedule/parse-slot-select";
import { Loader2 } from "lucide-react";
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

  const isEdit = Boolean(prefill?.ruleId);

  const [studentId, setStudentId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:00");
  const [startDate, setStartDate] = useState(() => todayIsoDateLocal());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitFailed(false);
    setIsSubmitting(false);
    const base = prefill ?? {
      dayOfWeek: new Date().getDay(),
      startTime: "17:00",
      endTime: "18:00",
    };
    setStudentId(
      base.studentId ?? activeStudents[0]?.id ?? "",
    );
    setDayOfWeek(
      base.dayOfWeek ??
        base.daysOfWeek?.[0] ??
        new Date().getDay(),
    );
    setStartTime(base.startTime);
    setEndTime(base.endTime);
    setStartDate(base.startDate ?? todayIsoDateLocal());
  }, [isOpen, prefill, activeStudents]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitFailed(false);
    const result = await upsertRecurringSession({
      id: prefill?.ruleId,
      studentId,
      daysOfWeek: [dayOfWeek],
      startTime,
      endTime,
      startDate,
    });
    setIsSubmitting(false);
    if (result.ok) {
      onClose();
      return;
    }
    setSubmitFailed(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? t("editSlotTitle") : t("addSlotTitle")}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {isEdit ? t("editSlotHint") : t("addSlotHint")}
      </p>

      {submitFailed && (
        <p
          className="mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-theme-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
          role="alert"
        >
          {t("slotSaveFailed")}
        </p>
      )}

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
              disabled={isEdit || isSubmitting}
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
            disabled={isSubmitting}
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
            onChange={(e) =>
              setDayOfWeek(Number.parseInt(e.target.value, 10))
            }
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClose}
            htmlType="button"
            disabled={isSubmitting}
          >
            {tCommon("close")}
          </Button>
          <Button
            size="sm"
            htmlType="submit"
            disabled={activeStudents.length === 0 || isSubmitting}
            startIcon={
              isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : undefined
            }
          >
            {isSubmitting ? t("slotSaving") : tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleSlotFormModal;
