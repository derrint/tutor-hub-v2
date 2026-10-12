"use client";

import { setActiveTutorIdAction } from "@/app/actions/tutor-context";
import Input from "@/components/form/input/InputField";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useRouter } from "@/i18n/navigation";
import { CheckLineIcon, ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const SEARCH_THRESHOLD = 5;

export default function AdminTutorSwitcher() {
  const t = useTranslations("header.tutorSwitcher");
  const { profile, tutorContext } = useAdminBootstrap();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { role, tutors, activeTutorId } = tutorContext;

  const viewingLabel = useMemo(() => {
    const studio = profile.studioName?.trim();
    if (studio) return studio;
    const active = tutors.find((row) => row.id === activeTutorId);
    return active?.displayName ?? t("unknownPractice");
  }, [profile.studioName, tutors, activeTutorId, t]);

  const filteredTutors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tutors;
    return tutors.filter((row) =>
      row.displayName.toLowerCase().includes(q),
    );
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

  if (role !== "ADMIN" || !activeTutorId) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <span
        className="inline-flex max-w-full items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-theme-xs font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
        title={t("viewingBadgeTitle")}
      >
        <span className="truncate">
          {t("viewing")}: {viewingLabel}
        </span>
      </span>

      <div className="relative min-w-0">
        <button
          type="button"
          className="dropdown-toggle flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={pendingId != null}
        >
          <span className="truncate">{t("switchTutor")}</span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setQuery("");
          }}
          className="absolute end-0 z-99999 mt-2 w-[min(100vw-2rem,18rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
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

          <ul role="listbox" className="max-h-60 overflow-y-auto custom-scrollbar">
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
    </div>
  );
}
