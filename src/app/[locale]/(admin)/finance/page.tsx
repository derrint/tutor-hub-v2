import FinanceOverview from "@/components/finance/FinanceOverview";
import { MOCK_INVOICE_PERIOD } from "@/lib/mock-data";
import { formatInvoicePeriodLabel } from "@/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("finance.title")} | ${t("brand")}` };
}

export default async function FinancePage() {
  const monthLabel = formatInvoicePeriodLabel(MOCK_INVOICE_PERIOD);

  return <FinanceOverview monthLabel={monthLabel} />;
}
