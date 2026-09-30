import ComponentCard from "@/components/common/ComponentCard";
import { useTranslations } from "next-intl";
import React from "react";

/** Collected vs unpaid as a single bar — the whole of the bar is what's billed. */
const PaymentComposition: React.FC<{ collectedPercent: number }> = ({
  collectedPercent,
}) => {
  const t = useTranslations("tutorHub.finance");

  return (
    <ComponentCard title={t("compositionTitle")}>
      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-warning-50 dark:bg-warning-500/15">
          <div
            className="h-full rounded-full bg-success-500 transition-[width] duration-300 ease-out"
            style={{ width: `${collectedPercent}%` }}
          />
        </div>
        <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
          {t("compositionNote")}
        </p>
      </div>
    </ComponentCard>
  );
};

export default PaymentComposition;
