"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminTutorListItem } from "@/lib/db/load-platform-admin";
import { PencilIcon } from "@/icons";
import { useTranslations } from "next-intl";

const HEADER_CELL =
  "px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400";

type TutorsTableProps = {
  tutors: AdminTutorListItem[];
  onEdit: (tutor: AdminTutorListItem) => void;
};

const TutorsTable: React.FC<TutorsTableProps> = ({ tutors, onEdit }) => {
  const t = useTranslations("tutorHub.admin.tutors");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnDisplayName")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} hidden sm:table-cell`}>
                {t("columnSlug")}
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnUsers")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} w-12`}>
                <span className="sr-only">{t("editAction")}</span>
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {tutors.map((tutor) => (
              <TableRow key={tutor.id}>
                <TableCell className="px-5 py-4 text-start">
                  <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {tutor.displayName}
                  </span>
                  <span className="mt-0.5 block font-mono text-theme-xs text-gray-500 sm:hidden dark:text-gray-400">
                    {tutor.slug ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden px-5 py-4 text-start font-mono text-theme-sm text-gray-500 sm:table-cell dark:text-gray-400">
                  {tutor.slug ?? "—"}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                  {tutor.userCount}
                </TableCell>
                <TableCell className="px-5 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => onEdit(tutor)}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
                    aria-label={t("editAria", { name: tutor.displayName })}
                  >
                    <PencilIcon className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TutorsTable;
