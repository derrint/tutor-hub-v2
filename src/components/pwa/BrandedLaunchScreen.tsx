"use client";

import TutorHubMark from "@/components/branding/TutorHubMark";
import { useTranslations } from "next-intl";

/** Full-screen splash while admin bootstrap loads (PWA first paint). */
export default function BrandedLaunchScreen() {
  const t = useTranslations("tutorHub");

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white dark:bg-gray-900"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <TutorHubMark className="size-16 text-brand-500 dark:text-brand-400" />
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          {t("brand")}
        </p>
      </div>
    </div>
  );
}
