"use client";

import ListPageEmptyState from "@/components/common/ListPageEmptyState";
import PageHeader from "@/components/common/PageHeader";
import StudentFormModal from "@/components/students/StudentFormModal";
import StudentsTable from "@/components/students/StudentsTable";
import Button from "@/components/ui/button/Button";
import { useRoster } from "@/context/RosterContext";
import { useModal } from "@/hooks/useModal";
import type { Student } from "@/lib/mock-data";
import { PlusIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const StudentsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.students");
  const { students, parents } = useRoster();
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<Student | null>(null);

  const activeCount = students.filter((s) => s.status === "ACTIVE").length;

  const handleAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (student: Student) => {
    setEditing(student);
    openModal();
  };

  const handleClose = () => {
    closeModal();
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={
          students.length === 0
            ? t("descriptionEmpty")
            : t("description", {
                active: activeCount,
                total: students.length,
              })
        }
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleAdd}
            disabled={parents.length === 0}
          >
            {t("add")}
          </Button>
        }
      />
      {students.length === 0 ? (
        <ListPageEmptyState
          title={
            parents.length === 0 ? t("emptyNoParentsTitle") : t("emptyTitle")
          }
          description={
            parents.length === 0
              ? t("emptyNoParentsDescription")
              : t("emptyDescription")
          }
          action={
            parents.length === 0 ? (
              <Link
                href="/parents"
                className="text-theme-sm font-medium text-brand-500 underline-offset-4 hover:underline"
              >
                {t("noParentsLink")}
              </Link>
            ) : (
              <Button
                size="sm"
                startIcon={<PlusIcon className="size-4" />}
                onClick={handleAdd}
              >
                {t("add")}
              </Button>
            )
          }
        />
      ) : (
        <StudentsTable onEdit={handleEdit} />
      )}
      <StudentFormModal
        isOpen={isOpen}
        onClose={handleClose}
        student={editing}
      />
    </div>
  );
};

export default StudentsPageContent;
