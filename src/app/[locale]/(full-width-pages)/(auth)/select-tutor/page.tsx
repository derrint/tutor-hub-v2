import SelectTutorForm from "@/components/auth/SelectTutorForm";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub.selectTutor");
  return { title: `${t("title")} | TutorHub` };
}

export default async function SelectTutorPage() {
  const [user, activeTutorId] = await Promise.all([
    getRequestUser(),
    getActiveTutorId(),
  ]);

  const locale = await getLocale();

  if (!user || user.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  if (activeTutorId) {
    redirect({ href: "/", locale });
  }

  const tutors = await prisma.tutor.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true },
  });

  return <SelectTutorForm tutors={tutors} />;
}
