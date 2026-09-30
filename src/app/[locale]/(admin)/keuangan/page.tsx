import PageHeader from "@/components/common/PageHeader";
import FinanceTotals from "@/components/finance/FinanceTotals";
import PaymentComposition from "@/components/finance/PaymentComposition";
import { Link } from "@/i18n/navigation";
import { FINANCE_SUMMARY, INVOICES } from "@/lib/mock-data";
import { formatInvoicePeriodLabel } from "@/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("finance.title")} | ${t("brand")}` };
}

export default async function KeuanganPage() {
  const t = await getTranslations("tutorHub.finance");

  const { period, totalBilled, collected, unpaid } = FINANCE_SUMMARY;
  const monthLabel = formatInvoicePeriodLabel(period);
  const hasInvoices = totalBilled > 0;
  const collectedPercent = hasInvoices
    ? Math.round((collected / totalBilled) * 100)
    : 0;
  const unpaidCount = INVOICES.filter((i) => i.status === "UNPAID").length;

  if (!hasInvoices) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          description={t("descriptionEmpty", { month: monthLabel })}
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white py-10 text-center dark:border-gray-800 dark:bg-white/3">
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {t("emptyTitle")}
          </p>
          <p className="max-w-100 text-theme-xs text-gray-500 dark:text-gray-400">
            {t("emptyDescription")}
          </p>
          <Link
            href="/tagihan"
            className="text-theme-sm font-medium text-brand-500 underline-offset-4 hover:underline"
          >
            {t("emptyCta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", {
          month: monthLabel,
          total: INVOICES.length,
          unpaidCount,
        })}
      />

      <div className="space-y-4 md:space-y-6">
        <FinanceTotals
          totalBilled={totalBilled}
          collected={collected}
          unpaid={unpaid}
          collectedPercent={collectedPercent}
          unpaidCount={unpaidCount}
        />
        <PaymentComposition collectedPercent={collectedPercent} />
      </div>
    </div>
  );
}
