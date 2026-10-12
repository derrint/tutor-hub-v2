import { prisma } from "@/lib/db/prisma";
import { parseMonthlyReportContent } from "@/lib/reports/content-schema";
import type { MonthlyReportPdfProps } from "@/lib/reports/pdf/MonthlyReportDocument";
import {
  formatInvoicePeriodLabel,
  type InvoicePeriod,
} from "@/utils/format";

export async function loadMonthlyReportPdfProps(input: {
  tutorId: string;
  studentId: string;
  period: InvoicePeriod;
}): Promise<MonthlyReportPdfProps | null> {
  const student = await prisma.student.findFirst({
    where: { id: input.studentId, tutorId: input.tutorId },
    select: { name: true, tutorId: true },
  });
  if (!student) return null;

  const [tutorRow, report] = await Promise.all([
    prisma.tutor.findUnique({
      where: { id: student.tutorId },
      select: { displayName: true, accountHolderName: true },
    }),
    prisma.monthlyReport.findUnique({
      where: {
        tutorId_studentId_month_year: {
          tutorId: student.tutorId,
          studentId: input.studentId,
          month: input.period.month,
          year: input.period.year,
        },
      },
      select: { contentJson: true },
    }),
  ]);
  const content = parseMonthlyReportContent(report?.contentJson);
  const periodLabel = formatInvoicePeriodLabel(input.period);

  const tutorDisplayName =
    tutorRow?.accountHolderName?.trim() ||
    tutorRow?.displayName?.trim() ||
    "";

  return {
    studentName: student.name,
    periodLabel,
    tutorDisplayName,
    content,
  };
}
