import ReportsPageContent from "@/components/reports/ReportsPageContent";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React, { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("reports.title")} | ${t("brand")}` };
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsPageContent />
    </Suspense>
  );
}
