"use client";

import PageHeader from "@/components/common/PageHeader";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { upsertTutorProfileAction } from "@/app/actions/profile";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const TutorProfileSettings: React.FC = () => {
  const t = useTranslations("tutorHub.settings");
  const { profile } = useAdminBootstrap();
  const router = useRouter();

  const [form, setForm] = useState({
    studioName: "",
    accountHolderName: "",
    bankName: "",
    bankAccountNumber: "",
    whatsappNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setForm({
      studioName: profile.studioName,
      accountHolderName: profile.accountHolderName,
      bankName: profile.bankName,
      bankAccountNumber: profile.bankAccountNumber,
      whatsappNumber: profile.whatsappNumber,
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(false);
    try {
      await upsertTutorProfileAction(form);
      router.refresh();
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3"
      >
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          {t("formHint")}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="studio-name">{t("fieldStudioName")}</Label>
            <Input
              id="studio-name"
              value={form.studioName}
              onChange={(e) =>
                setForm((f) => ({ ...f, studioName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="account-holder">{t("fieldAccountHolder")}</Label>
            <Input
              id="account-holder"
              value={form.accountHolderName}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  accountHolderName: e.target.value,
                }))
              }
              placeholder={t("fieldAccountHolderPlaceholder")}
            />
          </div>
          <div>
            <Label htmlFor="bank-name">{t("fieldBankName")}</Label>
            <Input
              id="bank-name"
              value={form.bankName}
              onChange={(e) =>
                setForm((f) => ({ ...f, bankName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="bank-account">{t("fieldBankAccount")}</Label>
            <Input
              id="bank-account"
              value={form.bankAccountNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  bankAccountNumber: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tutor-whatsapp">{t("fieldWhatsapp")}</Label>
            <Input
              id="tutor-whatsapp"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, whatsappNumber: e.target.value }))
              }
              placeholder="628…"
            />
          </div>
        </div>

        {saved && (
          <p className="mt-4 text-theme-sm text-success-600 dark:text-success-400">
            {t("saved")}
          </p>
        )}
        {error && (
          <p className="mt-4 text-theme-sm text-error-600 dark:text-error-400">
            {t("saveError")}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <Button size="sm" htmlType="submit" disabled={saving}>
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileSettings;
