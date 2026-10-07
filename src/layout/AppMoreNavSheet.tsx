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
  visible: boolean;
  onClose: () => void;
  onExited: () => void;
};

export default function AppMoreNavSheet({
  visible,
  onClose,
  onExited,
}: AppMoreNavSheetProps) {
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [visible, onClose]);

  const handlePanelTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform" || visible) return;
    onExited();
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 xl:hidden",
        bottomNavInsetClass,
        !visible && "pointer-events-none",
      )}
      aria-hidden={!visible}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none dark:bg-gray-900/40",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label={tCommon("close")}
        onClick={onClose}
        tabIndex={visible ? 0 : -1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTransitionEnd={handlePanelTransitionEnd}
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-2xl border border-gray-200 bg-white px-4 pb-4 pt-3 shadow-theme-lg transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-gray-800 dark:bg-gray-900",
          visible ? "translate-y-0" : "translate-y-full",
        )}
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
                  tabIndex={visible ? 0 : -1}
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
