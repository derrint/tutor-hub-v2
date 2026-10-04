import StudentsPageContent from "@/components/students/StudentsPageContent";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("students.title")} | ${t("brand")}` };
}

export default function StudentsPage() {
  return <StudentsPageContent />;
}
