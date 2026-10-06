"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ChatIcon, CopyIcon } from "@/icons";
import { formatIndonesianNameList } from "@/lib/whatsapp";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";

export type InvoiceWhatsAppPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  parentName: string;
  studentNames: string[];
  messageText: string;
  whatsAppUrl: string;
};

const InvoiceWhatsAppPreviewModal: React.FC<InvoiceWhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  parentName,
  studentNames,
  messageText,
  whatsAppUrl,
}) => {
  const t = useTranslations("tutorHub.invoices");
  const tCommon = useTranslations("common");
  const [copyLabel, setCopyLabel] = useState<"copy" | "copied">("copy");

  const handleClose = useCallback(() => {
    setCopyLabel("copy");
    onClose();
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopyLabel("copied");
      window.setTimeout(() => setCopyLabel("copy"), 2000);
    } catch {
      setCopyLabel("copy");
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    handleClose();
  };

  const attachNames = formatIndonesianNameList(studentNames);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg p-5 sm:max-w-xl sm:p-6"
    >
      <div>
        <h2 className="pe-10 text-theme-lg font-semibold text-gray-800 dark:text-white/90">
          {t("previewTitle")}
        </h2>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          {t("previewDescription", { parentName })}
        </p>

        <p className="mt-4 rounded-lg bg-warning-50 px-3 py-2 text-theme-xs text-warning-800 dark:bg-warning-500/10 dark:text-warning-400">
          {t("attachReportHintNamed", { names: attachNames })}
        </p>

        <div className="custom-scrollbar mt-4 max-h-[min(50vh,20rem)] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
          <pre className="text-theme-sm whitespace-pre-wrap font-normal text-gray-800 dark:text-white/90">
            {messageText}
          </pre>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            onClick={handleClose}
          >
            {tCommon("close")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            startIcon={<CopyIcon className="size-4" />}
            onClick={handleCopy}
          >
            {copyLabel === "copied" ? t("copiedMessage") : t("copyMessage")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            startIcon={<ChatIcon className="size-4" />}
            onClick={handleOpenWhatsApp}
          >
            {t("openWhatsApp")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceWhatsAppPreviewModal;
