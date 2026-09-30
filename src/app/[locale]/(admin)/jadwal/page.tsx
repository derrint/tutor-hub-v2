import ComponentCard from "@/components/common/ComponentCard";
import PageHeader from "@/components/common/PageHeader";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import SessionList from "@/components/schedule/SessionList";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { TODAY_SCHEDULE } from "@/lib/mock-data";
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

/**
 * Agenda list on a phone, weekly grid on a desktop. Both read the same session
 * data — the list from today's concrete sessions, the grid from the recurring
 * weekly pattern (see RECURRING_SESSIONS in mock-data.ts).
 */
export default async function JadwalPage() {
  const t = await getTranslations("tutorHub.schedule");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={formatFullDate(new Date())}
        action={
          <Button size="sm" startIcon={<PlusIcon className="size-5" />}>
            {t("add")}
          </Button>
        }
      />

      {/* Desktop: weekly calendar grid */}
      <div className="hidden lg:block">
        <p className="mb-4 text-theme-sm text-gray-500 dark:text-gray-400">
          {t("weeklyHint")}
        </p>
        <ScheduleCalendar />
      </div>

      {/* Mobile: today's agenda list */}
      <div className="lg:hidden">
        <ComponentCard title={t("todayTitle")}>
          <SessionList
            sessions={TODAY_SCHEDULE}
            emptyMessage={t("noSessionsToday")}
            ariaLabel={t("todayAgendaLabel")}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
