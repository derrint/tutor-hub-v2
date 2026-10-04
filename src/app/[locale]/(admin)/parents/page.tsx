import ParentsPageContent from "@/components/parents/ParentsPageContent";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("parents.title")} | ${t("brand")}` };
}

export default function ParentsPage() {
  return <ParentsPageContent />;
}
