"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export type RemoveWeeklySlotConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  weekdays: string;
  startTime: string;
  endTime: string;
  isSubmitting: boolean;
  onConfirm: () => void;
};

const RemoveWeeklySlotConfirmModal: React.FC<
  RemoveWeeklySlotConfirmModalProps
> = ({
  isOpen,
  onClose,
  studentName,
  weekdays,
  startTime,
  endTime,
  isSubmitting,
  onConfirm,
}) => {
  const t = useTranslations("tutorHub.schedule");
  const tCommon = useTranslations("common");

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      className="max-w-md p-5 sm:p-6"
    >
      <div>
        <h2 className="text-theme-lg pe-10 font-semibold text-gray-800 dark:text-white/90">
          {t("confirmRemoveWeeklySlotTitle")}
        </h2>
        <p className="mt-8 text-theme-sm text-gray-600 dark:text-gray-400">
          {t("confirmRemoveWeeklySlotBody", {
            studentName,
            weekdays,
            startTime,
            endTime,
          })}
        </p>
        <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("removeWeeklySlotHint")}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            disabled={isSubmitting}
            onClick={onClose}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : undefined
            }
            onClick={onConfirm}
          >
            {isSubmitting ? t("slotSaving") : t("removeWeeklySlot")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveWeeklySlotConfirmModal;
