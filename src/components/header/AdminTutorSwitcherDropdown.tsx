"use client";

import { setActiveTutorIdAction } from "@/app/actions/tutor-context";
import Input from "@/components/form/input/InputField";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useAdminInitial } from "@/context/AdminInitialContext";
import { useRouter } from "@/i18n/navigation";
import { CheckLineIcon, ChevronDownIcon, SchoolIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const SEARCH_THRESHOLD = 5;

type AdminTutorSwitcherDropdownProps = {
  className?: string;
  /** Panel anchor — use `end` beside the mobile app menu (screen edge). */
  menuAlign?: "start" | "end";
  /** Icon + chevron only (mobile header). */
  compact?: boolean;
};

const toggleButtonBaseClass =
  "dropdown-toggle flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 lg:h-11 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5";

export default function AdminTutorSwitcherDropdown({
  className,
  menuAlign = "start",
  compact = false,
}: AdminTutorSwitcherDropdownProps) {
  const t = useTranslations("header.tutorSwitcher");
  const { tutorContext } = useAdminInitial();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { role, tutors, activeTutorId } = tutorContext;

  const activeTutor = tutors.find((row) => row.id === activeTutorId);
  const activeLabel = activeTutor?.displayName ?? t("unknownPractice");

  const filteredTutors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tutors;
    return tutors.filter((row) => row.displayName.toLowerCase().includes(q));
  }, [query, tutors]);

  const handleSelect = useCallback(
    async (tutorId: string) => {
      if (tutorId === activeTutorId || pendingId) return;
      setPendingId(tutorId);
      const result = await setActiveTutorIdAction(tutorId);
      setPendingId(null);
      if (!result.ok) return;
      setIsOpen(false);
      setQuery("");
      router.refresh();
    },
    [activeTutorId, pendingId, router],
  );

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery("");
  };

  if (role !== "ADMIN" || !activeTutorId) {
    return null;
  }

  const menuPositionClass =
    menuAlign === "end" ? "absolute end-0" : "absolute start-0";

  return (
    <div className={cn("relative min-w-0 shrink-0", className)}>
      <button
        type="button"
        className={cn(
          toggleButtonBaseClass,
          compact
            ? "w-10 shrink-0 px-0 lg:w-11"
            : "max-w-[min(100%,11rem)] px-2.5",
        )}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("switchTutor")}
        disabled={pendingId != null}
        title={activeLabel}
      >
        <SchoolIcon className="size-5 shrink-0 text-gray-500 dark:text-gray-400" />
        {!compact && (
          <>
            <span className="truncate text-theme-sm font-medium">
              {activeLabel}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400",
                isOpen && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className={cn(
          menuPositionClass,
          "z-99999 mt-2 w-[min(100vw-2rem,18rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900",
        )}
      >
        {tutors.length >= SEARCH_THRESHOLD && (
          <div className="mb-2 px-1">
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9"
            />
          </div>
        )}

        <ul
          role="listbox"
          className="custom-scrollbar max-h-60 overflow-y-auto"
        >
          {filteredTutors.length === 0 ? (
            <li className="px-3 py-2 text-theme-sm text-gray-500 dark:text-gray-400">
              {t("noMatches")}
            </li>
          ) : (
            filteredTutors.map((tutor) => {
              const isActive = tutor.id === activeTutorId;
              const isPending = pendingId === tutor.id;
              return (
                <li key={tutor.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-theme-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                    )}
                    disabled={pendingId != null}
                    onClick={() => void handleSelect(tutor.id)}
                  >
                    <span className="truncate">
                      {isPending ? t("switching") : tutor.displayName}
                    </span>
                    {isActive && (
                      <CheckLineIcon className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
