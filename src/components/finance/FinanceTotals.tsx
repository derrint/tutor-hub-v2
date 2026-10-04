"use client";

import { Link } from "@/i18n/navigation";
import { formatRupiah } from "@/utils";
import { useTranslations } from "next-intl";
import React from "react";

interface FinanceTotalsProps {
  totalBilled: number;
  collected: number;
  unpaid: number;
  collectedPercent: number;
  unpaidCount: number;
}

const CARD = "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3";
const LABEL = "text-theme-sm font-medium";
const AMOUNT = "mt-2 text-title-sm font-bold tabular-nums";

const FinanceTotals: React.FC<FinanceTotalsProps> = ({
  totalBilled,
  collected,
  unpaid,
  collectedPercent,
  unpaidCount,
}) => {
  const t = useTranslations("tutorHub.finance");

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <div className={CARD}>
        <p className={`${LABEL} text-gray-500 dark:text-gray-400`}>
          {t("totalBilled")}
        </p>
        <p className={`${AMOUNT} text-gray-800 dark:text-white/90`}>
          {formatRupiah(totalBilled)}
        </p>
      </div>

      <div className={CARD}>
        <p className={`${LABEL} text-success-600 dark:text-success-500`}>
          {t("collected")}
        </p>
        <p className={`${AMOUNT} text-success-600 dark:text-success-500`}>
          {formatRupiah(collected)}
        </p>
        <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("collectedOfTotal", { percent: collectedPercent })}
        </p>
      </div>

      <div className={CARD}>
        <p className={`${LABEL} text-warning-600 dark:text-orange-400`}>
          {t("unpaid")}
        </p>
        <p className={`${AMOUNT} text-warning-600 dark:text-orange-400`}>
          {formatRupiah(unpaid)}
        </p>
        {unpaidCount > 0 && (
          <Link
            href="/invoices"
            className="mt-1 inline-block text-theme-xs font-medium text-warning-600 underline-offset-4 hover:underline dark:text-orange-400"
          >
            {t("viewUnpaid", { count: unpaidCount })}
          </Link>
        )}
      </div>
    </div>
  );
};

export default FinanceTotals;
