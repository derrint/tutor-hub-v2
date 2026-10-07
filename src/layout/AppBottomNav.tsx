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
import { useCallback, useEffect, useId, useRef, useState } from "react";

const MORE_SHEET_TRANSITION_MS = 320;

export default function AppBottomNav() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const [moreSheetMounted, setMoreSheetMounted] = useState(false);
  const [moreSheetVisible, setMoreSheetVisible] = useState(false);
  const morePanelId = useId();
  const moreActive = isMoreNavPath(pathname);

  const moreOpen = moreSheetMounted && moreSheetVisible;
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const finishMoreExit = useCallback(() => {
    clearExitTimer();
    setMoreSheetMounted(false);
    setMoreSheetVisible(false);
  }, [clearExitTimer]);

  const closeMore = useCallback(() => {
    setMoreSheetVisible(false);
    clearExitTimer();
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      finishMoreExit();
    }, MORE_SHEET_TRANSITION_MS);
  }, [clearExitTimer, finishMoreExit]);

  const handleMoreExited = useCallback(() => {
    finishMoreExit();
  }, [finishMoreExit]);

  const toggleMore = useCallback(() => {
    if (moreSheetVisible) {
      closeMore();
      return;
    }
    clearExitTimer();
    setMoreSheetMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMoreSheetVisible(true));
    });
  }, [clearExitTimer, closeMore, moreSheetVisible]);

  const dismissMore = useCallback(() => {
    closeMore();
  }, [closeMore]);

  useEffect(() => {
    if (!moreSheetMounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreSheetMounted]);

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
                  onClick={dismissMore}
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
                  <span className="max-w-full truncate text-xs">
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
              onClick={toggleMore}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-theme-xs font-medium transition-colors active:scale-95 motion-reduce:active:scale-100",
                moreActive || moreSheetMounted
                  ? "text-brand-500 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              {(moreActive || moreSheetMounted) && (
                <span
                  className="absolute inset-x-2 top-0 h-0.5 rounded-b-full bg-brand-500 transition-opacity duration-200 dark:bg-brand-400"
                  aria-hidden
                />
              )}
              <MoreDotIcon
                className={cn(
                  bottomNavIconClass,
                  "transition-transform duration-300 ease-out motion-reduce:transition-none",
                  moreSheetVisible && "scale-110",
                )}
              />
              <span className="text-xs">{t("more")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div id={morePanelId}>
        {moreSheetMounted && (
          <AppMoreNavSheet
            visible={moreSheetVisible}
            onClose={closeMore}
            onExited={handleMoreExited}
          />
        )}
      </div>
    </>
  );
}
