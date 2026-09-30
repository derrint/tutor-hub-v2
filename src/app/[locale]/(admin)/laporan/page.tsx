import PageHeader from "@/components/common/PageHeader";
import ReportRow from "@/components/reports/ReportRow";
import { FINANCE_SUMMARY, STUDENTS } from "@/lib/mock-data";
import { formatInvoicePeriodLabel } from "@/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("reports.title")} | ${t("brand")}` };
}

/**
 * One row per active student for the current month. The Montessori report
 * template (Practical Life, Sensorial, Language, Mathematics, Culture &
 * Science) is still pending from the tutor, so nothing here writes a report
 * yet and the draft/published split is still a placeholder.
 */
export default async function LaporanPage() {
  const t = await getTranslations("tutorHub.reports");

  const reports = STUDENTS.filter((s) => s.status === "ACTIVE").map(
    (student, idx) => ({ student, isDraft: idx % 2 === 0 }),
  );
  const draftCount = reports.filter((r) => r.isDraft).length;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", {
          month: formatInvoicePeriodLabel(FINANCE_SUMMARY.period),
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
}
