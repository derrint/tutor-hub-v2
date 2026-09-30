import PageHeader from "@/components/common/PageHeader";
import StudentsTable from "@/components/students/StudentsTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { STUDENTS } from "@/lib/mock-data";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub");

  return { title: `${t("students.title")} | ${t("brand")}` };
}

export default async function MuridPage() {
  const t = await getTranslations("tutorHub.students");

  const activeCount = STUDENTS.filter((s) => s.status === "ACTIVE").length;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", {
          active: activeCount,
          total: STUDENTS.length,
        })}
        action={
          <Button size="sm" startIcon={<PlusIcon className="size-5" />}>
            {t("add")}
          </Button>
        }
      />
      <StudentsTable />
    </div>
  );
}
