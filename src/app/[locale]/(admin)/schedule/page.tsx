import SchedulePageContent from "@/components/schedule/SchedulePageContent";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "@fullcalendar/react/themes/classic/theme.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("schedule.title")} | ${t("brand")}` };
}

export default function SchedulePage() {
  return <SchedulePageContent />;
}
