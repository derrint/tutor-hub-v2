"use client";

import { upsertAdminTutorAction } from "@/app/actions/admin-tutors";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { AdminTutorListItem } from "@/lib/db/load-platform-admin";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type TutorFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tutor?: AdminTutorListItem | null;
};

const emptyForm = {
  displayName: "",
  slug: "",
  accountHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  whatsappNumber: "",
};

const TutorFormModal: React.FC<TutorFormModalProps> = ({
  isOpen,
  onClose,
  tutor,
}) => {
  const t = useTranslations("tutorHub.admin.tutors");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorKey(null);
    if (tutor) {
      setForm({
        displayName: tutor.displayName,
        slug: tutor.slug ?? "",
        accountHolderName: tutor.accountHolderName ?? "",
        bankName: tutor.bankName ?? "",
        bankAccountNumber: tutor.bankAccountNumber ?? "",
        whatsappNumber: tutor.whatsappNumber ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, tutor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorKey(null);
    const result = await upsertAdminTutorAction({
      id: tutor?.id,
      ...form,
    });
    setSubmitting(false);
    if (!result.ok) {
      if (result.error === "CONFLICT" && result.field === "slug") {
        setErrorKey("errorSlugConflict");
      } else if (result.field === "slug") {
        setErrorKey("errorSlugInvalid");
      } else if (result.field === "displayName") {
        setErrorKey("errorDisplayName");
      } else {
        setErrorKey("errorForbidden");
      }
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-lg overflow-y-auto p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {tutor ? t("editTitle") : t("addTitle")}
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
          <Label htmlFor="tutor-display-name">{t("fieldDisplayName")}</Label>
          <Input
            id="tutor-display-name"
            value={form.displayName}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayName: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="tutor-slug">{t("fieldSlug")}</Label>
          <Input
            id="tutor-slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder={t("fieldSlugPlaceholder")}
          />
        </div>
        <div>
          <Label htmlFor="tutor-account-holder">{t("fieldAccountHolder")}</Label>
          <Input
            id="tutor-account-holder"
            value={form.accountHolderName}
            onChange={(e) =>
              setForm((f) => ({ ...f, accountHolderName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="tutor-bank-name">{t("fieldBankName")}</Label>
          <Input
            id="tutor-bank-name"
            value={form.bankName}
            onChange={(e) =>
              setForm((f) => ({ ...f, bankName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="tutor-bank-account">{t("fieldBankAccount")}</Label>
          <Input
            id="tutor-bank-account"
            value={form.bankAccountNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="tutor-whatsapp">{t("fieldWhatsApp")}</Label>
          <Input
            id="tutor-whatsapp"
            value={form.whatsappNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, whatsappNumber: e.target.value }))
            }
          />
        </div>

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

export default TutorFormModal;
