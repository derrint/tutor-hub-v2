import AdminUsersPageContent from "@/components/admin/users/AdminUsersPageContent";
import { redirect } from "@/i18n/navigation";
import {
  loadAdminTutorOptions,
  loadAdminUserList,
} from "@/lib/db/load-platform-admin";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return {
    title: `${t("admin.users.title")} | ${t("brand")}`,
  };
}

export default async function AdminUsersPage() {
  const locale = await getLocale();
  const user = await getRequestUser();
  if (user?.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  const [users, tutorOptions] = await Promise.all([
    loadAdminUserList(),
    loadAdminTutorOptions(),
  ]);

  return (
    <AdminUsersPageContent users={users} tutorOptions={tutorOptions} />
  );
}
