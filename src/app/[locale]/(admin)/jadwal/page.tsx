import PageHeader from "@/components/common/PageHeader";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { formatFullDate } from "@/utils";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "@fullcalendar/react/themes/classic/theme.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("schedule.title")} | ${t("brand")}` };
}

export default async function JadwalPage() {
  const t = await getTranslations("tutorHub.schedule");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={formatFullDate(new Date())}
        action={
          <Button size="sm" startIcon={<PlusIcon className="size-4" />}>
            {t("add")}
          </Button>
        }
      />

      <p className="mb-4 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("weeklyHint")}
      </p>
      <ScheduleCalendar />
    </div>
  );
}
