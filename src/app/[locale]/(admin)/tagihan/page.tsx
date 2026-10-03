import PageHeader from "@/components/common/PageHeader";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { INVOICES } from "@/lib/mock-data";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("invoices.title")} | ${t("brand")}` };
}

export default async function TagihanPage() {
  const t = await getTranslations("tutorHub.invoices");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Button size="sm" startIcon={<PlusIcon className="size-4" />}>
            {t("create")}
          </Button>
        }
      />

      {INVOICES.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-theme-sm text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {INVOICES.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
