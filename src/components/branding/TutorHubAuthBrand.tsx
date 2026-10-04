"use client";

import TutorHubMark from "@/components/branding/TutorHubMark";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

type TutorHubAuthBrandProps = {
  variant: "onDark" | "onLight";
  showTagline?: boolean;
  className?: string;
};

export default function TutorHubAuthBrand({
  variant,
  showTagline = true,
  className,
}: TutorHubAuthBrandProps) {
  const tBrand = useTranslations("tutorHub");
  const tAuth = useTranslations("tutorHub.auth");

  const onDark = variant === "onDark";

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-3 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40",
          onDark
            ? "text-white"
            : "text-brand-500 dark:text-brand-400",
        )}
        aria-label={tAuth("logoAlt")}
      >
        <TutorHubMark className="size-12" />
        <span
          className={cn(
            "text-2xl font-semibold tracking-tight",
            !onDark && "text-gray-900 dark:text-white/90",
          )}
        >
          {tBrand("brand")}
        </span>
      </Link>
      {showTagline && (
        <p
          className={cn(
            "mt-4 max-w-xs text-theme-sm",
            onDark ? "text-gray-400 dark:text-white/60" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {tAuth("tagline")}
        </p>
      )}
    </div>
  );
}
