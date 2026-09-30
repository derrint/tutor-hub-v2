import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import StudentAvatar from "@/components/common/StudentAvatar";
import Button from "@/components/ui/button/Button";
import { PencilIcon } from "@/icons";
import type { Student } from "@/lib/mock-data";
import { useTranslations } from "next-intl";
import React from "react";

interface ReportRowProps {
  student: Student;
  isDraft: boolean;
}

const ReportRow: React.FC<ReportRowProps> = ({ student, isDraft }) => {
  const t = useTranslations("tutorHub.reports");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
      <StudentAvatar name={student.name} level={student.level} />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {student.name}
          </p>
          <LevelBadge level={student.level} />
        </div>
        <div className="mt-1">
          <StatusBadge
            variant={isDraft ? "draft" : "published"}
            label={isDraft ? undefined : t("publishedLabel")}
          />
        </div>
      </div>

      <Button
        size="sm"
        variant={isDraft ? "primary" : "outline"}
        className="shrink-0"
        startIcon={
          <PencilIcon className="size-4 shrink-0 overflow-visible" />
        }
        aria-label={t(isDraft ? "writeDraftAria" : "editAria", {
          name: student.name,
        })}
      >
        {isDraft ? t("writeDraft") : t("edit")}
      </Button>
    </div>
  );
};

export default ReportRow;
