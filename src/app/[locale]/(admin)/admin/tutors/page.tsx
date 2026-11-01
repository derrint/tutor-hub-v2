import AdminTutorsPageContent from "@/components/admin/tutors/AdminTutorsPageContent";
import { redirect } from "@/i18n/navigation";
import { loadAdminTutorList } from "@/lib/db/load-platform-admin";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return {
    title: `${t("admin.tutors.title")} | ${t("brand")}`,
  };
}

export default async function AdminTutorsPage() {
  const locale = await getLocale();
  const user = await getRequestUser();
  if (user?.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  const tutors = await loadAdminTutorList();

  return <AdminTutorsPageContent tutors={tutors} />;
}
