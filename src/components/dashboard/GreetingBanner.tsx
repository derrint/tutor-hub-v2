"use client";

import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { formatFullDate, getTimeOfDayPeriod } from "@/utils";
import { useTranslations } from "next-intl";

/**
 * Personal greeting instead of a stock illustration, so the dashboard stays
 * specific to TutorHub rather than reading as a generic admin template.
 */
export default function GreetingBanner() {
  const t = useTranslations("tutorHub.dashboard");
  const { todaySessions } = useAdminBootstrap();
  const classesToday = todaySessions.length;
  const now = new Date();
  const period = getTimeOfDayPeriod(now);

  return (
    <div className="rounded-2xl bg-brand-500 px-5 py-5 text-white md:px-6">
      <p className="whitespace-pre-line text-theme-xl font-semibold">
        {t("greetingHeadline", {
          opener: t(`greetingOpener.${period}`),
          date: formatFullDate(now),
        })}
      </p>
      <p className="mt-1 text-theme-sm text-white/80">
        {classesToday > 0
          ? t("classesWaiting", { count: classesToday })
          : t("noClassesToday")}
      </p>
    </div>
  );
}
