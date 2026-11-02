"use client";

import ListPageEmptyState from "@/components/common/ListPageEmptyState";
import PageHeader from "@/components/common/PageHeader";
import ParentFormModal from "@/components/parents/ParentFormModal";
import ParentsTable from "@/components/parents/ParentsTable";
import Button from "@/components/ui/button/Button";
import { useRoster } from "@/context/RosterContext";
import { useModal } from "@/hooks/useModal";
import type { ParentRecord } from "@/lib/domain/types";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ParentsPageContent: React.FC = () => {
  const t = useTranslations("tutorHub.parents");
  const { parents } = useRoster();
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<ParentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (parent: ParentRecord) => {
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
        description={
          parents.length === 0
            ? t("descriptionEmpty")
            : t("description", { count: parents.length })
        }
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
      {parents.length === 0 ? (
        <ListPageEmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
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
      ) : (
        <ParentsTable onEdit={handleEdit} isBusy={isSaving} />
      )}
      <ParentFormModal
        isOpen={isOpen}
        onClose={handleClose}
        parent={editing}
        onSubmittingChange={setIsSaving}
      />
    </div>
  );
};

export default ParentsPageContent;
