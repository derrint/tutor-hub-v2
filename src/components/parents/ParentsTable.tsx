"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoster } from "@/context/RosterContext";
import type { MockParent } from "@/lib/mock-data";
import { PencilIcon } from "@/icons";
import { useTranslations } from "next-intl";

const HEADER_CELL =
  "px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400";

type ParentsTableProps = {
  onEdit: (parent: MockParent) => void;
};

const ParentsTable: React.FC<ParentsTableProps> = ({ onEdit }) => {
  const t = useTranslations("tutorHub.parents");
  const { parents, students } = useRoster();

  const studentCountByParent = (parentId: string) =>
    students.filter((s) => s.parentId === parentId).length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnName")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} hidden sm:table-cell`}>
                {t("columnSalutation")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} hidden md:table-cell`}>
                {t("columnWhatsApp")}
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnStudents")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} w-12`}>
                <span className="sr-only">{t("editAction")}</span>
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell className="px-5 py-4 text-start">
                  <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {parent.name}
                  </span>
                  <span className="mt-0.5 block text-theme-xs text-gray-500 sm:hidden dark:text-gray-400">
                    {parent.salutation}
                  </span>
                </TableCell>
                <TableCell className="hidden px-5 py-4 text-start text-theme-sm text-gray-500 sm:table-cell dark:text-gray-400">
                  {parent.salutation}
                </TableCell>
                <TableCell className="hidden px-5 py-4 text-start text-theme-sm tabular-nums text-gray-500 md:table-cell dark:text-gray-400">
                  {parent.whatsapp}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                  {studentCountByParent(parent.id)}
                </TableCell>
                <TableCell className="px-5 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => onEdit(parent)}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
                    aria-label={t("editAria", { name: parent.name })}
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

export default ParentsTable;
