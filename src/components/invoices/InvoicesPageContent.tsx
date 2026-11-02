"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import PageHeader from "@/components/common/PageHeader";
import BillingPageSkeleton from "@/components/loading/skeletons/BillingPageSkeleton";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { useAdminInitial } from "@/context/AdminInitialContext";
import { useInvoices } from "@/context/InvoiceContext";
import { isFutureBillingPeriod } from "@/lib/billing-period";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo } from "react";

const InvoicesPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.invoices");
  const { period } = useBillingPeriod();
  const { tutorContext } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const {
    getInvoicesForPeriod,
    isBillingReady,
    invoicesCacheEpoch,
    isPeriodLoading,
    loadInvoicesForPeriod,
  } = useInvoices();
  const isFuture = isFutureBillingPeriod(period);
  const monthLoading = isPeriodLoading(period);

  useEffect(() => {
    if (!isBillingReady) return;
    void loadInvoicesForPeriod(period);
  }, [
    activeTutorId,
    invoicesCacheEpoch,
    isBillingReady,
    loadInvoicesForPeriod,
    period.month,
    period.year,
  ]);

  const periodInvoices = useMemo(
    () => (isBillingReady && !monthLoading ? getInvoicesForPeriod(period) : []),
    [getInvoicesForPeriod, isBillingReady, monthLoading, period],
  );

  const unpaidCount = useMemo(
    () => periodInvoices.filter((invoice) => invoice.status === "UNPAID").length,
    [periodInvoices],
  );

  const showInitialSkeleton = !isBillingReady;
  const showMonthSkeleton = isBillingReady && monthLoading;

  if (showInitialSkeleton) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          description={t("pageSummaryEmpty")}
          action={<BillingMonthNavigator disabled />}
        />
        <BillingPageSkeleton includeHeader={false} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={
          showMonthSkeleton
            ? t("pageSummaryEmpty")
            : periodInvoices.length === 0
              ? t("pageSummaryEmpty")
              : t("pageSummary", {
                  count: periodInvoices.length,
                  unpaidCount,
                })
        }
        action={<BillingMonthNavigator disabled={monthLoading} />}
      />

      {showMonthSkeleton ? (
        <BillingPageSkeleton includeHeader={false} />
      ) : periodInvoices.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-theme-sm text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400">
          {isFuture ? t("emptyFuture") : t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {periodInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              actionsLocked={isFuture}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesPageContent;
