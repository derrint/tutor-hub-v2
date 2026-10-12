"use client";

import UserFormModal from "@/components/admin/users/UserFormModal";
import UsersTable from "@/components/admin/users/UsersTable";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import type { AdminUserListItem } from "@/lib/db/load-platform-admin";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

type AdminUsersPageContentProps = {
  users: AdminUserListItem[];
  tutorOptions: { id: string; displayName: string }[];
};

const AdminUsersPageContent: React.FC<AdminUsersPageContentProps> = ({
  users,
  tutorOptions,
}) => {
  const t = useTranslations("tutorHub.admin.users");
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<AdminUserListItem | null>(null);

  const handleAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (user: AdminUserListItem) => {
    setEditing(user);
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
        description={t("description", { count: users.length })}
        action={
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleAdd}
            disabled={tutorOptions.length === 0}
          >
            {t("add")}
          </Button>
        }
      />
      {tutorOptions.length === 0 && (
        <p className="mb-4 text-theme-sm text-warning-600 dark:text-warning-400">
          {t("noTutorsHint")}
        </p>
      )}
      <UsersTable users={users} onEdit={handleEdit} />
      <UserFormModal
        isOpen={isOpen}
        onClose={handleClose}
        user={editing}
        tutorOptions={tutorOptions}
      />
    </div>
  );
};

export default AdminUsersPageContent;
