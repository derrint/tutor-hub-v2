"use client";

import PageHeader from "@/components/common/PageHeader";
import StudentFormModal from "@/components/students/StudentFormModal";
import StudentsTable from "@/components/students/StudentsTable";
import Button from "@/components/ui/button/Button";
import { useRoster } from "@/context/RosterContext";
import { useModal } from "@/hooks/useModal";
import type { Student } from "@/lib/mock-data";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

const StudentsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.students");
  const { students } = useRoster();
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
        description={t("description", {
          active: activeCount,
          total: students.length,
        })}
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleAdd}
          >
            {t("add")}
          </Button>
        }
      />
      <StudentsTable onEdit={handleEdit} />
      <StudentFormModal
        isOpen={isOpen}
        onClose={handleClose}
        student={editing}
      />
    </div>
  );
};

export default StudentsPageContent;
