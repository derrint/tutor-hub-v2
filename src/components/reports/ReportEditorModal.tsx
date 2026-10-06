"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { StudentRecord } from "@/lib/domain/types";
import {
  bulletsToText,
  textToBullets,
  type MonthlyReportContentV1,
  type MonthlyReportPhoto,
} from "@/lib/reports/content-schema";
import { buildMonthlyReportPdfFilename } from "@/lib/reports/pdf/filename";
import type { InvoicePeriod } from "@/utils/format";
import { formatInvoicePeriodLabel } from "@/utils";
import {
  publishMonthlyReportAction,
  upsertMonthlyReportDraftAction,
} from "@/app/actions/reports";
import { CloseIcon, DownloadIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

const MAX_REPORT_PHOTOS = 4;
const MAX_PHOTO_BYTES = 450_000;

type ReportEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  period: InvoicePeriod;
  initialContent: MonthlyReportContentV1;
  onSaved: () => void;
};

const bulletTextareaClassName =
  "mt-2 min-h-28 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const notesTextareaClassName =
  "mt-2 min-h-36 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function newPhotoId(): string {
  return `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const ReportEditorModal: React.FC<ReportEditorModalProps> = ({
  isOpen,
  onClose,
  student,
  period,
  initialContent,
  onSaved,
}) => {
  const t = useTranslations("tutorHub.reports");
  const photoInputId = useId();

  const [canDoThisText, setCanDoThisText] = useState("");
  const [stillLearningText, setStillLearningText] = useState("");
  const [nextGoalsText, setNextGoalsText] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<MonthlyReportPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCanDoThisText(bulletsToText(initialContent.canDoThis));
    setStillLearningText(bulletsToText(initialContent.stillLearning));
    setNextGoalsText(bulletsToText(initialContent.nextGoals));
    setNotes(initialContent.notes);
    setPhotos(initialContent.photos);
    setPhotoError(null);
    setActionError(null);
  }, [isOpen, initialContent]);

  const buildContent = (): MonthlyReportContentV1 => ({
    version: 1,
    canDoThis: textToBullets(canDoThisText),
    stillLearning: textToBullets(stillLearningText),
    nextGoals: textToBullets(nextGoalsText),
    photos,
    notes: notes.trim(),
  });

  const persistContent = async (content: MonthlyReportContentV1) => {
    await upsertMonthlyReportDraftAction({
      studentId: student.id,
      period,
      content,
    });
    onSaved();
  };

  const handlePhotoPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const remaining = MAX_REPORT_PHOTOS - photos.length;
    if (remaining <= 0) {
      setPhotoError(t("photoLimit", { max: MAX_REPORT_PHOTOS }));
      return;
    }

    const toAdd = Array.from(files).slice(0, remaining);
    const next: MonthlyReportPhoto[] = [...photos];

    for (const file of toAdd) {
      if (!file.type.startsWith("image/")) {
        setPhotoError(t("photoTypeError"));
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(t("photoSizeError"));
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      next.push({ id: newPhotoId(), dataUrl });
    }

    setPhotos(next);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await persistContent(buildContent());
    } catch {
      setActionError(t("saveError"));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const content = buildContent();
      await persistContent(content);
      await publishMonthlyReportAction({
        studentId: student.id,
        period,
        content,
      });
      onSaved();

      const params = new URLSearchParams({
        studentId: student.id,
        month: String(period.month),
        year: String(period.year),
      });
      const response = await fetch(`/api/reports/pdf?${params.toString()}`);
      if (!response.ok) {
        throw new Error("PDF request failed");
      }

      const blob = await response.blob();
      const filename =
        parseContentDispositionFilename(
          response.headers.get("Content-Disposition"),
        ) ?? buildMonthlyReportPdfFilename(student.name, period);

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setActionError(t("pdfDownloadError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-5 sm:p-6"
    >
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        {t("editorKicker")}
      </p>
      <h2 className="mt-1 text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {student.name}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {formatInvoicePeriodLabel(period)}
      </p>
      <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
        {t("editorHint")}
      </p>

      <div className="mt-6 max-h-[min(70vh,640px)] space-y-5 overflow-y-auto pe-1 custom-scrollbar">
        <div>
          <Label htmlFor="report-can-do">{t("fieldCanDoThis")}</Label>
          <textarea
            id="report-can-do"
            className={bulletTextareaClassName}
            value={canDoThisText}
            onChange={(e) => setCanDoThisText(e.target.value)}
            placeholder={t("bulletsPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="report-still-learning">
            {t("fieldStillLearning")}
          </Label>
          <textarea
            id="report-still-learning"
            className={bulletTextareaClassName}
            value={stillLearningText}
            onChange={(e) => setStillLearningText(e.target.value)}
            placeholder={t("bulletsPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="report-next-goals">{t("fieldNextGoals")}</Label>
          <textarea
            id="report-next-goals"
            className={bulletTextareaClassName}
            value={nextGoalsText}
            onChange={(e) => setNextGoalsText(e.target.value)}
            placeholder={t("bulletsPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor={photoInputId}>{t("fieldPhotos")}</Label>
          <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
            {t("photosHint", { max: MAX_REPORT_PHOTOS })}
          </p>
          {photos.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((photo) => (
                <li key={photo.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from tutor uploads */}
                  <img
                    src={photo.dataUrl}
                    alt=""
                    className="aspect-square w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                  />
                  <button
                    type="button"
                    className="absolute end-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-gray-900/70 text-white hover:bg-gray-900"
                    aria-label={t("removePhotoAria")}
                    onClick={() => removePhoto(photo.id)}
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {photos.length < MAX_REPORT_PHOTOS && (
            <div className="mt-3">
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                multiple
                className="text-theme-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-theme-sm file:font-medium file:text-brand-600 dark:text-gray-400 dark:file:bg-brand-500/10 dark:file:text-brand-400"
                onChange={(e) => {
                  void handlePhotoPick(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          {photoError && (
            <p className="mt-2 text-theme-xs text-error-600 dark:text-error-400">
              {photoError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="report-notes">{t("fieldNotes")}</Label>
          <textarea
            id="report-notes"
            className={notesTextareaClassName}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("fieldNotesPlaceholder")}
          />
        </div>
      </div>

      {actionError && (
        <p className="mt-4 text-theme-xs text-error-600 dark:text-error-400">
          {actionError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={busy}
        >
          {t("save")}
        </Button>
        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={busy}
          startIcon={
            <DownloadIcon className="size-4 shrink-0 overflow-visible" />
          }
        >
          {t("downloadPdf")}
        </Button>
      </div>
    </Modal>
  );
};

function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) return null;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Invalid file read"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export default ReportEditorModal;
