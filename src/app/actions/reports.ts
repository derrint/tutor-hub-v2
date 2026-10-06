"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import {
  emptyMonthlyReportContent,
  parseMonthlyReportContent,
  serializeMonthlyReportContent,
  type MonthlyReportContentV1,
} from "@/lib/reports/content-schema";
import type { InvoicePeriod } from "@/utils/format";

export type MonthlyReportRow = {
  id: string;
  studentId: string;
  month: number;
  year: number;
  status: "DRAFT" | "PUBLISHED";
  content: MonthlyReportContentV1;
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
      contentJson: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    studentId: row.studentId,
    month: row.month,
    year: row.year,
    status: row.status as "DRAFT" | "PUBLISHED",
    content: parseMonthlyReportContent(row.contentJson),
  }));
}

export async function upsertMonthlyReportDraftAction(input: {
  studentId: string;
  period: InvoicePeriod;
  content: MonthlyReportContentV1;
}): Promise<MonthlyReportRow> {
  const contentJson = serializeMonthlyReportContent(input.content);

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
      contentJson,
    },
    update: {
      status: "DRAFT",
      contentJson,
    },
    select: {
      id: true,
      studentId: true,
      month: true,
      year: true,
      status: true,
      contentJson: true,
    },
  });

  revalidateAdminRoutes();
  return {
    id: row.id,
    studentId: row.studentId,
    month: row.month,
    year: row.year,
    status: row.status as "DRAFT" | "PUBLISHED",
    content: parseMonthlyReportContent(row.contentJson),
  };
}

export async function publishMonthlyReportAction(input: {
  studentId: string;
  period: InvoicePeriod;
  content?: MonthlyReportContentV1;
}): Promise<void> {
  const contentJson = input.content
    ? serializeMonthlyReportContent(input.content)
    : serializeMonthlyReportContent(emptyMonthlyReportContent());

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
      contentJson,
    },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      ...(input.content ? { contentJson } : {}),
    },
  });
  revalidateAdminRoutes();
}
