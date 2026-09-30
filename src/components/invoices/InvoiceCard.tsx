import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import type { InvoicePreview } from "@/lib/mock-data";
import { formatRupiah } from "@/utils";
import { useTranslations } from "next-intl";
import React from "react";

/**
 * One card per parent per month, mirroring the WhatsApp message the tutor
 * already sends by hand: a line per child with the session dates and subtotal,
 * then the grand total.
 */
const InvoiceCard: React.FC<{ invoice: InvoicePreview }> = ({ invoice }) => {
  const t = useTranslations("tutorHub.invoices");

  // The session dates already carry the month number ("2/9"); the short month
  // name is only there to read like the message she writes.
  const shortMonth = invoice.monthLabel.slice(0, 3);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {invoice.parentName}
          </h3>
          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
            {invoice.monthLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            variant={invoice.status === "PAID" ? "paid" : "unpaid"}
          />
          {invoice.status === "UNPAID" && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<PlusIcon className="size-4" />}
              aria-label={t("recreateAria", { parentName: invoice.parentName })}
            >
              {t("recreate")}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
        <ul className="flex flex-col gap-3">
          {invoice.children.map((child) => (
            <li
              key={child.id}
              className="flex items-start justify-between gap-4 text-theme-sm"
            >
              <span className="flex flex-col">
                <span className="text-gray-800 dark:text-white/90">
                  {child.name}{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    · {t("sessionCount", { count: child.sessionCount })}
                  </span>
                </span>
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  {child.sessionDates.join(", ")} {shortMonth}
                </span>
              </span>
              <span className="tabular-nums text-gray-800 dark:text-white/90">
                {formatRupiah(child.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {t("total")}
          </span>
          <span className="text-base font-bold tabular-nums text-gray-800 dark:text-white/90">
            {formatRupiah(invoice.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
