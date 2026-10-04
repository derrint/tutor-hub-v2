"use client";

import ComponentCard from "@/components/common/ComponentCard";
import SeeAllLink from "@/components/dashboard/SeeAllLink";
import SessionList from "@/components/schedule/SessionList";
import { TODAY_SCHEDULE } from "@/lib/mock-data";
import { useTranslations } from "next-intl";

export default function TodayScheduleCard() {
  const t = useTranslations("tutorHub.dashboard");

  return (
    <ComponentCard
      title={t("todayTitle")}
      action={<SeeAllLink href="/schedule" label={t("seeAll")} />}
    >
      <SessionList
        sessions={TODAY_SCHEDULE}
        emptyMessage={t("noScheduleToday")}
        ariaLabel={t("todayTitle")}
      />
    </ComponentCard>
  );
}
