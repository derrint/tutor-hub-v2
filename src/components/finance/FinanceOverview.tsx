"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import PageHeader from "@/components/common/PageHeader";
import BillingPageSkeleton from "@/components/loading/skeletons/BillingPageSkeleton";
import FinanceTotals from "@/components/finance/FinanceTotals";
import PaymentComposition from "@/components/finance/PaymentComposition";
import { billingMonthHref, useBillingPeriod } from "@/hooks/useBillingPeriod";
import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const FinanceOverview: React.FC = () => {
  const t = useTranslations("tutorHub.finance");
  const { period, monthParam } = useBillingPeriod();
  const {
    totalBilled,
    collected,
    unpaid,
    unpaidInvoiceCount,
    invoiceCount,
    isBillingReady,
  } = useFinanceSummary(period);

  if (!isBillingReady) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          description={t("descriptionEmpty")}
          action={<BillingMonthNavigator />}
        />
        <BillingPageSkeleton includeHeader={false} />
      </div>
    );
  }

  const hasInvoices = invoiceCount > 0;
  const collectedPercent =
    totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;

  if (!hasInvoices) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          description={t("descriptionEmpty")}
          action={<BillingMonthNavigator />}
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white py-10 text-center dark:border-gray-800 dark:bg-white/3">
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {t("emptyTitle")}
          </p>
          <p className="max-w-100 text-theme-xs text-gray-500 dark:text-gray-400">
            {t("emptyDescription")}
          </p>
          <Link
            href={billingMonthHref("/invoices", monthParam)}
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
          total: invoiceCount,
          unpaidCount: unpaidInvoiceCount,
        })}
        action={<BillingMonthNavigator />}
      />

      <div className="space-y-4 md:space-y-6">
        <FinanceTotals
          totalBilled={totalBilled}
          collected={collected}
          unpaid={unpaid}
          collectedPercent={collectedPercent}
          unpaidCount={unpaidInvoiceCount}
          invoicesMonthParam={monthParam}
        />
        <PaymentComposition collectedPercent={collectedPercent} />
      </div>
    </div>
  );
};

export default FinanceOverview;
