"use client";

import MetricCard from "@/components/dashboard/MetricCard";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { CalenderIcon } from "@/icons";
import { useTranslations } from "next-intl";

export default function ClassesTodayMetric() {
  const t = useTranslations("tutorHub.dashboard");
  const { todaySessions } = useAdminBootstrap();

  return (
    <MetricCard
      icon={
        <CalenderIcon className="size-6 text-gray-800 dark:text-white/90" />
      }
      label={t("classesToday")}
      value={todaySessions.length}
    />
  );
}
