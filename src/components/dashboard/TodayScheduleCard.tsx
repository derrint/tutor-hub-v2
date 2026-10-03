import ComponentCard from "@/components/common/ComponentCard";
import SessionList from "@/components/schedule/SessionList";
import { TODAY_SCHEDULE } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import SeeAllLink from "./SeeAllLink";

export default async function TodayScheduleCard() {
  const t = await getTranslations("tutorHub.dashboard");

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
