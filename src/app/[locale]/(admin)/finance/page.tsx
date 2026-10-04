import FinanceOverview from "@/components/finance/FinanceOverview";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React, { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("finance.title")} | ${t("brand")}` };
}

export default function FinancePage() {
  return (
    <Suspense fallback={null}>
      <FinanceOverview />
    </Suspense>
  );
}
