"use client";

import TutorHubAuthBrand from "@/components/branding/TutorHubAuthBrand";
import Button from "@/components/ui/button/Button";
import { setActiveTutorIdAction } from "@/app/actions/tutor-context";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export type SelectTutorOption = {
  id: string;
  displayName: string;
};

type SelectTutorFormProps = {
  tutors: SelectTutorOption[];
};

export default function SelectTutorForm({ tutors }: SelectTutorFormProps) {
  const t = useTranslations("tutorHub.selectTutor");
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback(
    async (tutorId: string) => {
      setPendingId(tutorId);
      setError(null);
      const result = await setActiveTutorIdAction(tutorId);
      setPendingId(null);
      if (!result.ok) {
        setError(t("selectFailed"));
        return;
      }
      router.push("/");
      router.refresh();
    },
    [router, t],
  );

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10 pt-10 sm:pt-16">
        <TutorHubAuthBrand variant="onLight" className="mb-10 lg:hidden" />

        <div className="mb-8">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
            {t("title")}
          </h1>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>

        {error && (
          <p
            className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-theme-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
            role="alert"
          >
            {error}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {tutors.map((tutor) => (
            <li key={tutor.id}>
              <Button
                htmlType="button"
                variant="outline"
                className="w-full justify-start"
                disabled={pendingId != null}
                onClick={() => void handleSelect(tutor.id)}
              >
                {pendingId === tutor.id ? t("opening") : tutor.displayName}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
