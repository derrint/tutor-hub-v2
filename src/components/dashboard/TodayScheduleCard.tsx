"use client";

import ComponentCard from "@/components/common/ComponentCard";
import SeeAllLink from "@/components/dashboard/SeeAllLink";
import SessionList from "@/components/schedule/SessionList";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useTranslations } from "next-intl";

export default function TodayScheduleCard() {
  const t = useTranslations("tutorHub.dashboard");
  const { todaySessions } = useAdminBootstrap();

  return (
    <ComponentCard
      title={t("todayTitle")}
      action={<SeeAllLink href="/schedule" label={t("seeAll")} />}
    >
      <SessionList
        sessions={todaySessions}
        emptyMessage={t("noScheduleToday")}
        ariaLabel={t("todayTitle")}
      />
    </ComponentCard>
  );
}
