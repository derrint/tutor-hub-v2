"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRoster } from "@/context/RosterContext";
import type { ParentRecord } from "@/lib/domain/types";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ParentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  parent?: ParentRecord | null;
  onSubmittingChange?: (isSubmitting: boolean) => void;
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
  onSubmittingChange,
}) => {
  const t = useTranslations("tutorHub.parents");
  const tCommon = useTranslations("common");
  const { upsertParent } = useRoster();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitFailed(false);
    setIsSubmitting(false);
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

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitFailed(false);
    const result = await upsertParent({
      id: parent?.id,
      ...form,
    });
    setIsSubmitting(false);
    if (result.ok) {
      onClose();
      return;
    }
    setSubmitFailed(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {parent ? t("editTitle") : t("addTitle")}
      </h2>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {t("formHint")}
      </p>

      {submitFailed && (
        <p
          className="mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-theme-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
          role="alert"
        >
          {t("saveFailed")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="parent-name">{t("fieldName")}</Label>
          <Input
            id="parent-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClose}
            htmlType="button"
            disabled={isSubmitting}
          >
            {tCommon("close")}
          </Button>
          <Button
            size="sm"
            htmlType="submit"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : undefined
            }
          >
            {isSubmitting ? t("saving") : tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ParentFormModal;
