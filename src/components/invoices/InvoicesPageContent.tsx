"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import PageHeader from "@/components/common/PageHeader";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { useInvoices } from "@/context/InvoiceContext";
import { isFutureBillingPeriod } from "@/lib/billing-period";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

const InvoicesPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.invoices");
  const { period } = useBillingPeriod();
  const { getInvoicesForPeriod } = useInvoices();
  const isFuture = isFutureBillingPeriod(period);

  const periodInvoices = useMemo(
    () => getInvoicesForPeriod(period),
    [getInvoicesForPeriod, period],
  );

  const unpaidCount = useMemo(
    () => periodInvoices.filter((invoice) => invoice.status === "UNPAID").length,
    [periodInvoices],
  );

  return (
    <div>
      <BillingMonthNavigator />

      <PageHeader
        title={t("title")}
        description={
          periodInvoices.length === 0
            ? t("pageSummaryEmpty")
            : t("pageSummary", {
                count: periodInvoices.length,
                unpaidCount,
              })
        }
      />

      {periodInvoices.length === 0 ? (
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
