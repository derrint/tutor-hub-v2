"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import PageHeader from "@/components/common/PageHeader";
import ReportRow from "@/components/reports/ReportRow";
import { useRoster } from "@/context/RosterContext";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

/**
 * One row per active student for the selected billing month. Report editor
 * fields wait on the tutor's Montessori template (Phase 3).
 */
const ReportsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.reports");
  const { students } = useRoster();

  const reports = useMemo(
    () =>
      students.filter((s) => s.status === "ACTIVE").map((student, idx) => ({
        student,
        isDraft: idx % 2 === 0,
      })),
    [students],
  );

  const draftCount = reports.filter((r) => r.isDraft).length;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", {
          draftCount,
          total: reports.length,
        })}
        action={<BillingMonthNavigator />}
      />

      <div className="flex flex-col gap-3">
        {reports.map(({ student, isDraft }) => (
          <ReportRow key={student.id} student={student} isDraft={isDraft} />
        ))}
      </div>
    </div>
  );
};

export default ReportsPageContent;
