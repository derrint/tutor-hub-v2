import ActiveStudentsMetric from "@/components/dashboard/ActiveStudentsMetric";
import ClassesTodayMetric from "@/components/dashboard/ClassesTodayMetric";
import GreetingBanner from "@/components/dashboard/GreetingBanner";
import MonthlyCollectionCard from "@/components/dashboard/MonthlyCollectionCard";
import TodayScheduleCard from "@/components/dashboard/TodayScheduleCard";
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
  return (
    <div className="space-y-4 md:space-y-6">
      <GreetingBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <ClassesTodayMetric />
        <ActiveStudentsMetric />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <TodayScheduleCard />
        <MonthlyCollectionCard />
      </div>
    </div>
  );
}
