"use client";

import TutorFormModal from "@/components/admin/tutors/TutorFormModal";
import TutorsTable from "@/components/admin/tutors/TutorsTable";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import type { AdminTutorListItem } from "@/lib/db/load-platform-admin";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

type AdminTutorsPageContentProps = {
  tutors: AdminTutorListItem[];
};

const AdminTutorsPageContent: React.FC<AdminTutorsPageContentProps> = ({
  tutors,
}) => {
  const t = useTranslations("tutorHub.admin.tutors");
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<AdminTutorListItem | null>(null);

  const handleAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (tutor: AdminTutorListItem) => {
    setEditing(tutor);
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
        description={t("description", { count: tutors.length })}
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
      <TutorsTable tutors={tutors} onEdit={handleEdit} />
      <TutorFormModal isOpen={isOpen} onClose={handleClose} tutor={editing} />
    </div>
  );
};

export default AdminTutorsPageContent;
