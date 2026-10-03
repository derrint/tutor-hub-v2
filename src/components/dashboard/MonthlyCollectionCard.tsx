import ComponentCard from "@/components/common/ComponentCard";
import { FINANCE_SUMMARY } from "@/lib/mock-data";
import { formatRupiah } from "@/utils";
import { getTranslations } from "next-intl/server";
import SeeAllLink from "./SeeAllLink";

export default async function MonthlyCollectionCard() {
  const t = await getTranslations("tutorHub.dashboard");

  const { totalBilled, collected, unpaid } = FINANCE_SUMMARY;
  const hasInvoices = totalBilled > 0;
  const collectedPercent = hasInvoices
    ? Math.round((collected / totalBilled) * 100)
    : 0;

  return (
    <ComponentCard
      title={t("financeTitle")}
      action={<SeeAllLink href="/finance" label={t("seeAll")} />}
    >
      {hasInvoices ? (
        <div>
          <p className="text-title-sm font-bold tabular-nums text-gray-800 dark:text-white/90">
            {collectedPercent}%{" "}
            <span className="text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              {t("collectedSuffix")}
            </span>
          </p>
          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
            {t("ofTotal", { amount: formatRupiah(totalBilled) })}
          </p>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-success-500 transition-[width] duration-300 ease-out"
              style={{ width: `${collectedPercent}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-success-50 px-3 py-2 dark:bg-success-500/15">
              <p className="text-theme-xs text-success-600 dark:text-success-500">
                {t("collected")}
              </p>
              <p className="text-theme-sm font-semibold tabular-nums text-success-600 dark:text-success-500">
                {formatRupiah(collected)}
              </p>
            </div>
            <div className="rounded-lg bg-warning-50 px-3 py-2 dark:bg-warning-500/15">
              <p className="text-theme-xs text-warning-600 dark:text-orange-400">
                {t("unpaid")}
              </p>
              <p className="text-theme-sm font-semibold tabular-nums text-warning-600 dark:text-orange-400">
                {formatRupiah(unpaid)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="py-2 text-theme-sm text-gray-500 dark:text-gray-400">
          {t("noInvoices")}
        </p>
      )}
    </ComponentCard>
  );
}
