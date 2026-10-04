"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import PageHeader from "@/components/common/PageHeader";
import ReportRow from "@/components/reports/ReportRow";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { STUDENTS } from "@/lib/mock-data";
import { formatInvoicePeriodLabel } from "@/utils";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

/**
 * One row per active student for the selected billing month. Report editor
 * fields wait on the tutor's Montessori template (Phase 3).
 */
const ReportsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.reports");
  const { period } = useBillingPeriod();

  const reports = useMemo(
    () =>
      STUDENTS.filter((s) => s.status === "ACTIVE").map((student, idx) => ({
        student,
        isDraft: idx % 2 === 0,
      })),
    [],
  );

  const draftCount = reports.filter((r) => r.isDraft).length;
  const monthLabel = formatInvoicePeriodLabel(period);

  return (
    <div>
      <BillingMonthNavigator />
      <PageHeader
        title={t("title")}
        description={t("description", {
          month: monthLabel,
          draftCount,
          total: reports.length,
        })}
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
