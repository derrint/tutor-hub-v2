"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRoster } from "@/context/RosterContext";
import type { MockParent } from "@/lib/mock-data";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ParentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  parent?: MockParent | null;
};

const emptyForm = {
  name: "",
  salutation: "",
  honorific: "",
  whatsapp: "",
};

const ParentFormModal: React.FC<ParentFormModalProps> = ({
  isOpen,
  onClose,
  parent,
}) => {
  const t = useTranslations("tutorHub.parents");
  const tCommon = useTranslations("common");
  const { upsertParent } = useRoster();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (parent) {
      setForm({
        name: parent.name,
        salutation: parent.salutation,
        honorific: parent.honorific,
        whatsapp: parent.whatsapp,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, parent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertParent({
      id: parent?.id,
      ...form,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {parent ? t("editTitle") : t("addTitle")}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("formHint")}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="parent-name">{t("fieldName")}</Label>
          <Input
            id="parent-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="parent-salutation">{t("fieldSalutation")}</Label>
          <Input
            id="parent-salutation"
            value={form.salutation}
            onChange={(e) =>
              setForm((f) => ({ ...f, salutation: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="parent-honorific">{t("fieldHonorific")}</Label>
          <Input
            id="parent-honorific"
            value={form.honorific}
            onChange={(e) =>
              setForm((f) => ({ ...f, honorific: e.target.value }))
            }
            placeholder="Ma"
            required
          />
        </div>
        <div>
          <Label htmlFor="parent-whatsapp">{t("fieldWhatsApp")}</Label>
          <Input
            id="parent-whatsapp"
            inputMode="numeric"
            value={form.whatsapp}
            onChange={(e) =>
              setForm((f) => ({ ...f, whatsapp: e.target.value }))
            }
            placeholder="6281234567890"
            required
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} htmlType="button">
            {tCommon("close")}
          </Button>
          <Button size="sm" htmlType="submit">
            {tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ParentFormModal;
