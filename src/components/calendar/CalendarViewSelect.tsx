"use client";

import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/utils";
import React, { useRef, useState } from "react";
import { CALENDAR_VIEW_OPTIONS, type CalendarViewOption } from "./types";

export type CalendarViewSelectWeekendsProps = {
  showWeekends: boolean;
  onShowWeekendsChange: (show: boolean) => void;
  label: string;
  ariaLabel: string;
};

export interface CalendarViewSelectProps {
  currentView: string;
  onViewChange: (viewKey: string) => void;
  options?: CalendarViewOption[];
  weekends?: CalendarViewSelectWeekendsProps;
}

const CalendarViewSelect: React.FC<CalendarViewSelectProps> = ({
  currentView,
  onViewChange,
  options = CALENDAR_VIEW_OPTIONS,
  weekends,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const activeOption =
    options.find((v) => v.key === currentView) ||
    options.find((v) => v.key === "dayGridMonth") ||
    options[1];

  const handleSelect = (viewKey: string) => {
    onViewChange(viewKey);
    setIsOpen(false);
  };

  return (
    <div className="calendar-view-dropdown relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="calendar-view-btn flex h-9 w-full min-w-18 items-center justify-center gap-1 rounded-lg border border-gray-300 ps-2.5 pe-1.5 text-xs font-medium text-gray-700 shadow-xs sm:min-w-20 sm:gap-1.5 sm:ps-3 sm:pe-2 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="calendar-view-label">{activeOption.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "calendar-view-chevron h-4 w-4 transition-transform duration-200 sm:h-4.5 sm:w-4.5",
            {
              "rotate-180": isOpen,
            },
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="calendar-view-menu absolute inset-e-0 z-50 mt-1.5 w-40 max-w-[calc(100vw-32px)] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg sm:w-44 dark:border-gray-700 dark:bg-gray-900"
          role="menu"
        >
          <div className="space-y-0.5" role="group" aria-label={activeOption.label}>
            {options.map((view) => (
              <button
                key={view.key}
                type="button"
                role="menuitemradio"
                aria-checked={currentView === view.key}
                data-view-key={view.key}
                onClick={() => handleSelect(view.key)}
                className={cn(
                  "calendar-view-option w-full rounded-lg px-2.5 py-1.5 text-start text-xs text-gray-700 hover:bg-gray-100 sm:text-sm dark:text-gray-300 dark:hover:bg-white/5",
                  currentView === view.key
                    ? "bg-gray-100 font-medium dark:bg-white/5"
                    : "font-normal",
                )}
              >
                {view.label}
              </button>
            ))}
          </div>

          {weekends && (
            <>
              <div
                className="my-1.5 border-t border-gray-200 dark:border-gray-700"
                role="separator"
              />
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={weekends.showWeekends}
                aria-label={weekends.ariaLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  weekends.onShowWeekendsChange(!weekends.showWeekends);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-start text-xs text-gray-700 hover:bg-gray-100 sm:text-sm dark:text-gray-300 dark:hover:bg-white/5"
              >
                <span className="font-medium">{weekends.label}</span>
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-150",
                    weekends.showWeekends
                      ? "bg-brand-500"
                      : "bg-gray-200 dark:bg-white/10",
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-4 rounded-full bg-white shadow-theme-sm transition-transform duration-150 ease-linear start-0.5",
                      weekends.showWeekends &&
                        "translate-x-4 rtl:-translate-x-4",
                    )}
                  />
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarViewSelect;
