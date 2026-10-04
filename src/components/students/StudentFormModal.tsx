"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRoster } from "@/context/RosterContext";
import type { EducationLevel, Student, StudentStatus } from "@/lib/mock-data";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

type StudentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
};

type FormState = {
  name: string;
  age: string;
  level: EducationLevel;
  feePerSession: string;
  status: StudentStatus;
  parentId: string;
};

const emptyForm: FormState = {
  name: "",
  age: "",
  level: "TK",
  feePerSession: "",
  status: "ACTIVE",
  parentId: "",
};

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const t = useTranslations("tutorHub.students");
  const tCommon = useTranslations("common");
  const { parents, upsertStudent } = useRoster();
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (student) {
      setForm({
        name: student.name,
        age: String(student.age),
        level: student.level,
        feePerSession: String(student.feePerSession),
        status: student.status,
        parentId: student.parentId,
      });
    } else {
      setForm({
        ...emptyForm,
        parentId: parents[0]?.id ?? "",
      });
    }
  }, [isOpen, student, parents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = Number.parseInt(form.age, 10);
    const feePerSession = Number.parseInt(form.feePerSession, 10);
    if (!form.parentId || !Number.isFinite(age) || !Number.isFinite(feePerSession)) {
      return;
    }
    upsertStudent({
      id: student?.id,
      name: form.name,
      age,
      level: form.level,
      feePerSession,
      status: form.status,
      parentId: form.parentId,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {student ? t("editTitle") : t("addTitle")}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="student-name">{t("fieldName")}</Label>
          <Input
            id="student-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student-age">{t("fieldAge")}</Label>
            <Input
              id="student-age"
              type="number"
              min={1}
              max={18}
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="student-level">{t("columnLevel")}</Label>
            <select
              id="student-level"
              className={selectClassName}
              value={form.level}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  level: e.target.value as EducationLevel,
                }))
              }
            >
              <option value="TK">TK</option>
              <option value="SD">SD</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="student-fee">{t("columnFee")}</Label>
          <Input
            id="student-fee"
            type="number"
            min={0}
            step={1000}
            value={form.feePerSession}
            onChange={(e) =>
              setForm((f) => ({ ...f, feePerSession: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="student-status">{t("columnStatus")}</Label>
          <select
            id="student-status"
            className={selectClassName}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as StudentStatus,
              }))
            }
          >
            <option value="ACTIVE">{t("statusActive")}</option>
            <option value="INACTIVE">{t("statusInactive")}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="student-parent">{t("columnParent")}</Label>
          {parents.length === 0 ? (
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              {t("noParentsHint")}{" "}
              <Link
                href="/parents"
                className="font-medium text-brand-500 underline-offset-4 hover:underline"
              >
                {t("noParentsLink")}
              </Link>
            </p>
          ) : (
            <select
              id="student-parent"
              className={selectClassName}
              value={form.parentId}
              onChange={(e) =>
                setForm((f) => ({ ...f, parentId: e.target.value }))
              }
              required
            >
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} htmlType="button">
            {tCommon("close")}
          </Button>
          <Button size="sm" disabled={parents.length === 0} htmlType="submit">
            {tCommon("saveChanges")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal;
