"use client";

import {
  isFutureBillingPeriod,
  periodFromMonthInputValue,
  toMonthInputValue,
} from "@/lib/billing-period";
import { useBillingPeriod } from "@/hooks/useBillingPeriod";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { formatInvoicePeriodLabel } from "@/utils";
import { useTranslations } from "next-intl";
import React, { useId } from "react";

const BillingMonthNavigator: React.FC = () => {
  const t = useTranslations("tutorHub.billingMonth");
  const { period, setPeriod, goToPreviousMonth, goToNextMonth } =
    useBillingPeriod();
  const inputId = useId();
  const isFuture = isFutureBillingPeriod(period);

  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1">
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
          className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 text-theme-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-white/3 dark:text-white/90 sm:max-w-44"
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

      <p className="text-theme-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-800 dark:text-white/90">
          {formatInvoicePeriodLabel(period)}
        </span>
        {isFuture && (
          <span className="ms-2 text-theme-xs text-warning-600 dark:text-orange-400">
            {t("futureHint")}
          </span>
        )}
      </p>
    </div>
  );
};

export default BillingMonthNavigator;
