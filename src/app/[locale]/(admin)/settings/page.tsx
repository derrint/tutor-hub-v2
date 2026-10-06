import TutorProfileSettings from "@/components/settings/TutorProfileSettings";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("settings.title")} | ${t("brand")}` };
}

export default function SettingsPage() {
  return <TutorProfileSettings />;
}
