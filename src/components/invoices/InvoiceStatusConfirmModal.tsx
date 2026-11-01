"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { InvoiceStatus } from "@/lib/domain/types";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export type InvoiceStatusConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  intent: InvoiceStatus;
  parentName: string;
  periodLabel: string;
  isSubmitting: boolean;
  onConfirm: () => void;
};

const InvoiceStatusConfirmModal: React.FC<InvoiceStatusConfirmModalProps> = ({
  isOpen,
  onClose,
  intent,
  parentName,
  periodLabel,
  isSubmitting,
  onConfirm,
}) => {
  const t = useTranslations("tutorHub.invoices");
  const tCommon = useTranslations("common");

  const isPaid = intent === "PAID";

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      className="max-w-md p-5 sm:p-6"
    >
      <div>
        <h2 className="text-theme-lg pe-10 font-semibold text-gray-800 dark:text-white/90">
          {isPaid ? t("confirmMarkPaidTitle") : t("confirmMarkUnpaidTitle")}
        </h2>
        <p className="mt-8 text-theme-sm text-gray-600 dark:text-gray-400">
          {isPaid
            ? t("confirmMarkPaidBody", { parentName, period: periodLabel })
            : t("confirmMarkUnpaidBody", { parentName, period: periodLabel })}
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
            variant={isPaid ? "outlineSuccess" : "outlineWarning"}
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : undefined
            }
            onClick={onConfirm}
          >
            {isSubmitting
              ? t("statusSaving")
              : isPaid
                ? t("markPaid")
                : t("markUnpaid")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceStatusConfirmModal;
