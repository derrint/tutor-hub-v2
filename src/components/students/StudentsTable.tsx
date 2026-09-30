import LevelBadge from "@/components/common/LevelBadge";
import StatusBadge from "@/components/common/StatusBadge";
import StudentAvatar from "@/components/common/StudentAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STUDENTS } from "@/lib/mock-data";
import { formatRupiah } from "@/utils";
import { useTranslations } from "next-intl";

const HEADER_CELL =
  "px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400";

const StudentsTable: React.FC = () => {
  const t = useTranslations("tutorHub.students");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnStudent")}
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnLevel")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} hidden md:table-cell`}>
                {t("columnParent")}
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} hidden md:table-cell`}>
                {t("columnFee")}
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                {t("columnStatus")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {STUDENTS.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="px-5 py-4 text-start">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.name} level={student.level} />
                    <div>
                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {student.name}
                      </span>
                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                        {t("age", { count: student.age })}
                        {/* Parent and fee have their own columns from md up. */}
                        <span className="md:hidden">
                          {" · "}
                          {student.parentName}
                          {" · "}
                          {formatRupiah(student.feePerSession)}
                        </span>
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <LevelBadge level={student.level} />
                </TableCell>
                <TableCell className="hidden px-5 py-4 text-start text-theme-sm text-gray-500 md:table-cell dark:text-gray-400">
                  {student.parentName}
                </TableCell>
                <TableCell className="hidden px-5 py-4 text-start text-theme-sm tabular-nums text-gray-500 md:table-cell dark:text-gray-400">
                  {formatRupiah(student.feePerSession)}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <StatusBadge
                    variant={student.status === "ACTIVE" ? "active" : "inactive"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentsTable;
