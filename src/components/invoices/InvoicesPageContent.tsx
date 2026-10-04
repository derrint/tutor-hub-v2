"use client";

import BillingMonthNavigator from "@/components/billing/BillingMonthNavigator";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/button/Button";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { useInvoices } from "@/context/InvoiceContext";
import { isFutureBillingPeriod } from "@/lib/billing-period";
import { listParentIdsWithScheduledSessions } from "@/lib/invoices";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

const InvoicesPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.invoices");
  const { period } = useBillingPeriod();
  const { invoices, createMissingInvoicesForPeriod } = useInvoices();
  const isFuture = isFutureBillingPeriod(period);

  const periodInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.period.month === period.month &&
          invoice.period.year === period.year,
      ),
    [invoices, period.month, period.year],
  );

  const unpaidCount = useMemo(
    () => periodInvoices.filter((invoice) => invoice.status === "UNPAID").length,
    [periodInvoices],
  );

  const canCreate =
    !isFuture && listParentIdsWithScheduledSessions(period).length > 0;

  const handleCreate = () => {
    createMissingInvoicesForPeriod(period);
  };

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
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleCreate}
            disabled={!canCreate}
            aria-label={t("createAria")}
          >
            {t("create")}
          </Button>
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
