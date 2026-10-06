"use client";

import AppMoreNavSheet from "@/layout/AppMoreNavSheet";
import {
  bottomNavIconClass,
  bottomNavPrimaryItems,
  isMoreNavPath,
  isNavItemActive,
} from "@/layout/admin-nav-items";
import { Link, usePathname } from "@/i18n/navigation";
import { MoreDotIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

export default function AppBottomNav() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const morePanelId = useId();
  const moreActive = isMoreNavPath(pathname);

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] xl:hidden dark:border-gray-800 dark:bg-gray-900"
        aria-label={t("bottomNavLabel")}
      >
        <ul className="grid h-16 grid-cols-5">
          {bottomNavPrimaryItems.map((item) => {
            const active = isNavItemActive(pathname, item.path);
            const { Icon } = item;
            return (
              <li key={item.key}>
                <Link
                  href={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "relative flex h-full flex-col items-center justify-center gap-0.5 px-1 text-theme-xs font-medium transition-colors",
                    active
                      ? "text-brand-500 dark:text-brand-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  )}
                >
                  {active && (
                    <span
                      className="absolute inset-x-2 top-0 h-0.5 rounded-b-full bg-brand-500 dark:bg-brand-400"
                      aria-hidden
                    />
                  )}
                  <Icon className={bottomNavIconClass} />
                  <span className="truncate max-w-full">
                    {t(`items.${item.key}`)}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls={morePanelId}
              onClick={() => setMoreOpen((prev) => !prev)}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-theme-xs font-medium transition-colors",
                moreActive || moreOpen
                  ? "text-brand-500 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              {(moreActive || moreOpen) && (
                <span
                  className="absolute inset-x-2 top-0 h-0.5 rounded-b-full bg-brand-500 dark:bg-brand-400"
                  aria-hidden
                />
              )}
              <MoreDotIcon className={bottomNavIconClass} />
              <span>{t("more")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div id={morePanelId}>
        <AppMoreNavSheet open={moreOpen} onClose={closeMore} />
      </div>
    </>
  );
}
