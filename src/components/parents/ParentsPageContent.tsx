"use client";

import PageHeader from "@/components/common/PageHeader";
import ParentFormModal from "@/components/parents/ParentFormModal";
import ParentsTable from "@/components/parents/ParentsTable";
import Button from "@/components/ui/button/Button";
import { useRoster } from "@/context/RosterContext";
import { useModal } from "@/hooks/useModal";
import type { MockParent } from "@/lib/mock-data";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ParentsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.parents");
  const { parents } = useRoster();
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<MockParent | null>(null);

  const handleAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (parent: MockParent) => {
    setEditing(parent);
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
        description={t("description", { count: parents.length })}
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
      <ParentsTable onEdit={handleEdit} />
      <ParentFormModal
        isOpen={isOpen}
        onClose={handleClose}
        parent={editing}
      />
    </div>
  );
};

export default ParentsPageContent;
