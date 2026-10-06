import { prisma } from "@/lib/db/prisma";
import { parseMonthlyReportContent } from "@/lib/reports/content-schema";
import type { MonthlyReportPdfProps } from "@/lib/reports/pdf/MonthlyReportDocument";
import {
  formatInvoicePeriodLabel,
  type InvoicePeriod,
} from "@/utils/format";

export async function loadMonthlyReportPdfProps(input: {
  studentId: string;
  period: InvoicePeriod;
}): Promise<MonthlyReportPdfProps | null> {
  const [student, profileRow] = await Promise.all([
    prisma.student.findUnique({
      where: { id: input.studentId },
      select: { name: true },
    }),
    prisma.profile.findFirst({
      select: { accountHolderName: true },
    }),
  ]);
  if (!student) return null;

  const report = await prisma.monthlyReport.findUnique({
    where: {
      studentId_month_year: {
        studentId: input.studentId,
        month: input.period.month,
        year: input.period.year,
      },
    },
    select: { contentJson: true },
  });

  const content = parseMonthlyReportContent(report?.contentJson);
  const periodLabel = formatInvoicePeriodLabel(input.period);

  const tutorDisplayName = profileRow?.accountHolderName?.trim() ?? "";

  return {
    studentName: student.name,
    periodLabel,
    tutorDisplayName,
    content,
  };
}
