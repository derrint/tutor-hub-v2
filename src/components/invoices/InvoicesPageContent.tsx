"use client";

import InvoiceCard from "@/components/invoices/InvoiceCard";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/button/Button";
import { useInvoices } from "@/context/InvoiceContext";
import { PlusIcon } from "@/icons";
import { MOCK_INVOICE_PERIOD } from "@/lib/mock-data";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

const InvoicesPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.invoices");
  const { invoices, createMissingInvoicesForPeriod } = useInvoices();

  const periodInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.period.month === MOCK_INVOICE_PERIOD.month &&
          invoice.period.year === MOCK_INVOICE_PERIOD.year,
      ),
    [invoices],
  );

  const handleCreate = () => {
    createMissingInvoicesForPeriod(MOCK_INVOICE_PERIOD);
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleCreate}
            aria-label={t("createAria")}
          >
            {t("create")}
          </Button>
        }
      />

      {periodInvoices.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-theme-sm text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {periodInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesPageContent;
