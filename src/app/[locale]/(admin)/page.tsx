import GreetingBanner from "@/components/dashboard/GreetingBanner";
import MetricCard from "@/components/dashboard/MetricCard";
import MonthlyCollectionCard from "@/components/dashboard/MonthlyCollectionCard";
import TodayScheduleCard from "@/components/dashboard/TodayScheduleCard";
import ActiveStudentsMetric from "@/components/dashboard/ActiveStudentsMetric";
import { CalenderIcon } from "@/icons";
import { TODAY_SCHEDULE } from "@/lib/mock-data";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return {
    title: `${t("dashboard.title")} | ${t("brand")}`,
    description: t("dashboard.greeting"),
  };
}

export default async function Dashboard() {
  const t = await getTranslations("tutorHub.dashboard");

  const classesToday = TODAY_SCHEDULE.length;

  return (
    <div className="space-y-4 md:space-y-6">
      <GreetingBanner classesToday={classesToday} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <MetricCard
          icon={<CalenderIcon className="size-6 text-gray-800 dark:text-white/90" />}
          label={t("classesToday")}
          value={classesToday}
        />
        <ActiveStudentsMetric />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <TodayScheduleCard />
        <MonthlyCollectionCard />
      </div>
    </div>
  );
}
