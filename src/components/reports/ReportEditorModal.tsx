"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { StudentRecord } from "@/lib/domain/types";
import type { InvoicePeriod } from "@/utils/format";
import {
  publishMonthlyReportAction,
  upsertMonthlyReportDraftAction,
} from "@/app/actions/reports";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ReportEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  period: InvoicePeriod;
  initialNotes: string;
  isPublished: boolean;
  onSaved: () => void;
};

const ReportEditorModal: React.FC<ReportEditorModalProps> = ({
  isOpen,
  onClose,
  student,
  period,
  initialNotes,
  isPublished,
  onSaved,
}) => {
  const t = useTranslations("tutorHub.reports");
  const tCommon = useTranslations("common");
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setNotes(initialNotes);
  }, [isOpen, initialNotes]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await upsertMonthlyReportDraftAction({
        studentId: student.id,
        period,
        generalNotes: notes,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await upsertMonthlyReportDraftAction({
        studentId: student.id,
        period,
        generalNotes: notes,
      });
      await publishMonthlyReportAction({
        studentId: student.id,
        period,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {t("editorTitle", { name: student.name })}
      </h2>
      <p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("editorTemplatePending")}
      </p>

      <div className="mt-6">
        <Label htmlFor="report-notes">{t("fieldGeneralNotes")}</Label>
        <textarea
          id="report-notes"
          className="mt-2 min-h-32 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("fieldGeneralNotesPlaceholder")}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>
          {tCommon("close")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleSaveDraft} disabled={saving}>
          {t("saveDraft")}
        </Button>
        {!isPublished && (
          <Button size="sm" onClick={handlePublish} disabled={saving}>
            {t("publish")}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default ReportEditorModal;
