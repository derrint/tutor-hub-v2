"use client";

import PageHeader from "@/components/common/PageHeader";
import ScheduleCalendarMountSkeleton from "@/components/loading/skeletons/ScheduleCalendarMountSkeleton";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import ScheduleSlotFormModal from "@/components/schedule/ScheduleSlotFormModal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import {
  defaultSlotPrefill,
  slotPrefillFromDateSelect,
  type SlotPrefill,
} from "@/lib/schedule/parse-slot-select";
import { PlusIcon } from "@/icons";
import type { DateSelectInfo } from "@fullcalendar/react";
import { formatFullDate } from "@/utils";
import { useTranslations } from "next-intl";
import type { RecurringSession } from "@/lib/domain/types";
import { useCallback, useState } from "react";

const SchedulePageContent: React.FC = () => {
  const t = useTranslations("tutorHub.schedule");
  const { isOpen, openModal, closeModal } = useModal();
  const [slotPrefill, setSlotPrefill] = useState<SlotPrefill | null>(null);
  const [calendarReady, setCalendarReady] = useState(false);

  const openAddSlot = useCallback(
    (prefill: SlotPrefill | null) => {
      setSlotPrefill(prefill);
      openModal();
    },
    [openModal],
  );

  const handleAddClick = () => {
    openAddSlot(defaultSlotPrefill());
  };

  const handleTimeSlotSelect = (info: DateSelectInfo) => {
    if (
      info.view.type !== "timeGridWeek" &&
      info.view.type !== "timeGridDay"
    ) {
      return;
    }
    openAddSlot(slotPrefillFromDateSelect(info));
  };

  const handleEditWeeklySlot = (
    session: RecurringSession,
    occurrenceDate: Date | null,
  ) => {
    const dayOfWeek =
      occurrenceDate?.getDay() ?? session.daysOfWeek[0] ?? new Date().getDay();
    openAddSlot({
      ruleId: session.id,
      studentId: session.studentId,
      startDate: session.startDate,
      dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
    });
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={formatFullDate(new Date())}
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleAddClick}
          >
            {t("add")}
          </Button>
        }
      />

      <p className="mb-4 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("weeklyHint")}
      </p>

      <div className="relative">
        {!calendarReady && (
          <div className="absolute inset-0 z-10" aria-busy="true">
            <ScheduleCalendarMountSkeleton />
          </div>
        )}
        <ScheduleCalendar
          onTimeSlotSelect={handleTimeSlotSelect}
          onEditWeeklySlot={handleEditWeeklySlot}
          onCalendarReady={() => setCalendarReady(true)}
        />
      </div>

      <ScheduleSlotFormModal
        isOpen={isOpen}
        onClose={closeModal}
        prefill={slotPrefill}
      />
    </div>
  );
};

export default SchedulePageContent;
