"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  bottomNavInsetClass,
  bottomNavMoreItems,
  bottomNavIconClass,
  isNavItemActive,
} from "@/layout/admin-nav-items";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useEffect, useId } from "react";

type AppMoreNavSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function AppMoreNavSheet({
  open,
  onClose,
}: AppMoreNavSheetProps) {
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 xl:hidden",
        bottomNavInsetClass,
      )}
    >
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm dark:bg-gray-900/40"
        aria-label={tCommon("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-gray-200 bg-white px-4 pb-4 pt-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <p
          id={titleId}
          className="mb-2 px-1 text-theme-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {t("more")}
        </p>
        <ul className="flex flex-col gap-1">
          {bottomNavMoreItems.map((item) => {
            const active = isNavItemActive(pathname, item.path);
            const { Icon } = item;
            return (
              <li key={item.key}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-theme-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                  )}
                >
                  <Icon
                    className={cn(
                      bottomNavIconClass,
                      active
                        ? "text-brand-500 dark:text-brand-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  />
                  {t(`items.${item.key}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
