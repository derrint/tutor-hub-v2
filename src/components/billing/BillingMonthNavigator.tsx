"use client";

import {
  isFutureBillingPeriod,
  periodFromMonthInputValue,
  toMonthInputValue,
} from "@/lib/billing-period";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import React, { useId } from "react";

type BillingMonthNavigatorProps = {
  className?: string;
};

const BillingMonthNavigator: React.FC<BillingMonthNavigatorProps> = ({
  className,
}) => {
  const t = useTranslations("tutorHub.billingMonth");
  const { period, setPeriod, goToPreviousMonth, goToNextMonth } =
    useBillingPeriod();
  const inputId = useId();
  const isFuture = isFutureBillingPeriod(period);

  return (
    <div className={cn("flex flex-col items-end gap-1.5", className)}>
      {isFuture && (
        <span className="text-theme-xs text-warning-600 dark:text-orange-400">
          {t("futureHint")}
        </span>
      )}

      <div className="flex max-w-full flex-wrap items-center justify-end gap-1">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400 dark:hover:bg-white/5"
          aria-label={t("previousMonth")}
        >
          <ChevronLeftIcon className="size-5 rtl:rotate-180" />
        </button>

        <label htmlFor={inputId} className="sr-only">
          {t("selectMonth")}
        </label>
        <input
          id={inputId}
          type="month"
          value={toMonthInputValue(period)}
          onChange={(event) => {
            const next = periodFromMonthInputValue(event.target.value);
            if (next) setPeriod(next);
          }}
          className="h-9 min-w-0 rounded-lg border border-gray-200 bg-white px-2 text-theme-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-white/3 dark:text-white/90 sm:min-w-44"
        />

        <button
          type="button"
          onClick={goToNextMonth}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400 dark:hover:bg-white/5"
          aria-label={t("nextMonth")}
        >
          <ChevronRightIcon className="size-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default BillingMonthNavigator;
