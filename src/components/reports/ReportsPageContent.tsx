"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import PageHeader from "@/components/common/PageHeader";
import ReportEditorModal from "@/components/reports/ReportEditorModal";
import ReportRow, {
  type ReportRowState,
} from "@/components/reports/ReportRow";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { useRoster } from "@/context/RosterContext";
import {
  listMonthlyReportsForPeriod,
  type MonthlyReportRow,
} from "@/app/actions/reports";
import { emptyMonthlyReportContent } from "@/lib/reports/content-schema";
import type { StudentRecord } from "@/lib/domain/types";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const ReportsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.reports");
  const { period } = useBillingPeriod();
  const { students } = useRoster();
  const [dbReports, setDbReports] = useState<MonthlyReportRow[]>([]);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null,
  );

  const loadReports = useCallback(async () => {
    const rows = await listMonthlyReportsForPeriod(period);
    setDbReports(rows);
  }, [period]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const reportByStudentId = useMemo(
    () => new Map(dbReports.map((r) => [r.studentId, r])),
    [dbReports],
  );

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "ACTIVE"),
    [students],
  );

  const draftCount = useMemo(
    () =>
      activeStudents.filter((student) => {
        const row = reportByStudentId.get(student.id);
        return (
          !row ||
          row.status === "DRAFT" ||
          (row.status === "PUBLISHED" && row.pdfNeedsRefresh)
        );
      }).length,
    [activeStudents, reportByStudentId],
  );

  const editingReport = editingStudent
    ? reportByStudentId.get(editingStudent.id)
    : undefined;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", {
          draftCount,
          total: activeStudents.length,
        })}
        action={<BillingMonthNavigator />}
      />

      <div className="flex flex-col gap-3">
        {activeStudents.map((student) => {
          const row = reportByStudentId.get(student.id);
          const state: ReportRowState = !row
            ? "notStarted"
            : row.status === "PUBLISHED"
              ? row.pdfNeedsRefresh
                ? "publishedStale"
                : "published"
              : "draft";
          return (
            <ReportRow
              key={student.id}
              student={student}
              state={state}
              onEdit={() => setEditingStudent(student)}
            />
          );
        })}
      </div>

      {editingStudent && (
        <ReportEditorModal
          isOpen={editingStudent != null}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
          period={period}
          initialContent={
            editingReport?.content ?? emptyMonthlyReportContent()
          }
          pdfNeedsRefresh={editingReport?.pdfNeedsRefresh ?? false}
          onSaved={() => void loadReports()}
        />
      )}
    </div>
  );
};

export default ReportsPageContent;
