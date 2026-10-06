"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import type { InvoicePeriod } from "@/utils/format";

export type MonthlyReportRow = {
  id: string;
  studentId: string;
  month: number;
  year: number;
  status: "DRAFT" | "PUBLISHED";
  generalNotes: string | null;
};

export async function listMonthlyReportsForPeriod(
  period: InvoicePeriod,
): Promise<MonthlyReportRow[]> {
  const rows = await prisma.monthlyReport.findMany({
    where: { month: period.month, year: period.year },
    select: {
      id: true,
      studentId: true,
      month: true,
      year: true,
      status: true,
      generalNotes: true,
    },
  });
  return rows.map((row) => ({
    ...row,
    status: row.status as "DRAFT" | "PUBLISHED",
  }));
}

export async function upsertMonthlyReportDraftAction(input: {
  studentId: string;
  period: InvoicePeriod;
  generalNotes: string;
}): Promise<MonthlyReportRow> {
  const row = await prisma.monthlyReport.upsert({
    where: {
      studentId_month_year: {
        studentId: input.studentId,
        month: input.period.month,
        year: input.period.year,
      },
    },
    create: {
      studentId: input.studentId,
      month: input.period.month,
      year: input.period.year,
      status: "DRAFT",
      generalNotes: input.generalNotes.trim() || null,
      contentJson: { placeholder: true },
    },
    update: {
      status: "DRAFT",
      generalNotes: input.generalNotes.trim() || null,
    },
    select: {
      id: true,
      studentId: true,
      month: true,
      year: true,
      status: true,
      generalNotes: true,
    },
  });

  revalidateAdminRoutes();
  return { ...row, status: row.status as "DRAFT" | "PUBLISHED" };
}

export async function publishMonthlyReportAction(input: {
  studentId: string;
  period: InvoicePeriod;
}): Promise<void> {
  await prisma.monthlyReport.upsert({
    where: {
      studentId_month_year: {
        studentId: input.studentId,
        month: input.period.month,
        year: input.period.year,
      },
    },
    create: {
      studentId: input.studentId,
      month: input.period.month,
      year: input.period.year,
      status: "PUBLISHED",
      publishedAt: new Date(),
      contentJson: { placeholder: true },
    },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  revalidateAdminRoutes();
}
