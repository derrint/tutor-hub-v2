import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import StudentAvatar from "@/components/common/StudentAvatar";
import Button from "@/components/ui/button/Button";
import { PencilIcon } from "@/icons";
import type { StudentRecord } from "@/lib/domain/types";
import { useTranslations } from "next-intl";
import React from "react";

export type ReportRowState = "notStarted" | "draft" | "published";

interface ReportRowProps {
  student: StudentRecord;
  state: ReportRowState;
  onEdit: () => void;
}

const ReportRow: React.FC<ReportRowProps> = ({ student, state, onEdit }) => {
  const t = useTranslations("tutorHub.reports");

  const badgeVariant =
    state === "published" ? "published" : "draft";
  const badgeLabel =
    state === "published"
      ? t("publishedLabel")
      : state === "draft"
        ? t("draftSavedLabel")
        : t("notStartedLabel");

  const buttonVariant =
    state === "notStarted" ? "primary" : "outline";
  const buttonLabel =
    state === "published"
      ? t("edit")
      : state === "draft"
        ? t("editDraft")
        : t("writeDraft");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
      <StudentAvatar
        name={student.name}
        level={student.level}
        studentId={student.id}
        calendarColorKey={student.calendarColorKey}
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {student.name}
          </p>
          <LevelBadge level={student.level} />
        </div>
        <div className="mt-1">
          <StatusBadge variant={badgeVariant} label={badgeLabel} />
        </div>
      </div>

      <Button
        size="sm"
        variant={buttonVariant}
        className="shrink-0"
        onClick={onEdit}
        startIcon={
          <PencilIcon className="size-4 shrink-0 overflow-visible" />
        }
        aria-label={t(
          state === "notStarted"
            ? "writeDraftAria"
            : state === "draft"
              ? "editDraftAria"
              : "editAria",
          { name: student.name },
        )}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

export default ReportRow;
