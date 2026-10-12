"use client";

import { upsertAdminUserAction } from "@/app/actions/admin-users";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { AdminUserListItem } from "@/lib/db/load-platform-admin";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUserListItem | null;
  tutorOptions: { id: string; displayName: string }[];
};

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  tutorOptions,
}) => {
  const t = useTranslations("tutorHub.admin.users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "TUTOR">("TUTOR");
  const [tutorId, setTutorId] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tutorSelectOptions = useMemo(
    () =>
      tutorOptions.map((opt) => ({
        value: opt.id,
        label: opt.displayName,
      })),
    [tutorOptions],
  );

  const roleOptions = useMemo(
    () => [
      { value: "TUTOR", label: t("roleTutor") },
      { value: "ADMIN", label: t("roleAdmin") },
    ],
    [t],
  );

  useEffect(() => {
    if (!isOpen) return;
    setErrorKey(null);
    if (user) {
      setEmail(user.email);
      setRole(user.role);
      setTutorId(user.tutorId ?? "");
    } else {
      setEmail("");
      setRole("TUTOR");
      setTutorId(tutorOptions[0]?.id ?? "");
    }
  }, [isOpen, user, tutorOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorKey(null);
    const result = await upsertAdminUserAction({
      id: user?.id,
      email,
      role,
      tutorId,
    });
    setSubmitting(false);
    if (!result.ok) {
      if (result.error === "CONFLICT" && result.field === "email") {
        setErrorKey("errorEmailConflict");
      } else if (result.field === "email") {
        setErrorKey("errorEmailInvalid");
      } else if (result.field === "tutorId") {
        setErrorKey("errorTutorRequired");
      } else {
        setErrorKey("errorForbidden");
      }
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {user ? t("editTitle") : t("addTitle")}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("formHint")}
      </p>

      {errorKey && (
        <p className="mt-4 text-theme-sm text-error-600 dark:text-error-400">
          {t(errorKey)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="user-email">{t("fieldEmail")}</Label>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <Label>{t("fieldRole")}</Label>
          <Select
            key={`role-${user?.id ?? "new"}-${isOpen}`}
            options={roleOptions}
            defaultValue={role}
            onChange={(value) => setRole(value as "ADMIN" | "TUTOR")}
            placeholder={t("fieldRole")}
          />
        </div>
        {role === "TUTOR" && (
          <div>
            <Label>{t("fieldTutor")}</Label>
            <Select
              key={`tutor-${user?.id ?? "new"}-${isOpen}-${tutorOptions.length}`}
              options={tutorSelectOptions}
              defaultValue={tutorId}
              onChange={setTutorId}
              placeholder={t("fieldTutorPlaceholder")}
            />
          </div>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} htmlType="button">
            {tCommon("close")}
          </Button>
          <Button size="sm" htmlType="submit" disabled={submitting}>
            {tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
