"use client";

import {
  deleteParentAction,
  upsertParentAction,
  upsertStudentAction,
  deleteStudentAction,
  type DeleteStudentResult,
  type ParentInput,
  type StudentInput,
  type UpsertStudentResult,
} from "@/app/actions/roster";
import { useAdminInitial } from "@/context/AdminInitialContext";
import type { ParentRecord, StudentRecord } from "@/lib/domain/types";
import {
  applyStudentDeleteOverlay,
  applyStudentUpsertOverlay,
  emptyStudentOverlay,
  mergeStudentsWithOverlay,
  reconcileStudentOverlay,
  type StudentOverlay,
} from "@/lib/roster/merge-student-overlay";
import { useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type RosterContextValue = {
  parents: ParentRecord[];
  students: StudentRecord[];
  getParentById: (parentId: string) => ParentRecord | undefined;
  parentDisplayName: (parentId: string) => string;
  upsertParent: (input: ParentInput) => Promise<ParentRecord>;
  deleteParent: (parentId: string) => Promise<boolean>;
  upsertStudent: (input: StudentInput) => Promise<UpsertStudentResult>;
  deleteStudent: (studentId: string) => Promise<DeleteStudentResult>;
};

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const {
    parents,
    students: serverStudents,
    tutorContext,
  } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const router = useRouter();
  const [studentOverlay, setStudentOverlay] = useState<StudentOverlay>(() =>
    emptyStudentOverlay(),
  );

  useEffect(() => {
    setStudentOverlay(emptyStudentOverlay());
  }, [activeTutorId]);

  useEffect(() => {
    setStudentOverlay((prev) =>
      reconcileStudentOverlay(serverStudents, prev),
    );
  }, [serverStudents]);

  const students = useMemo(
    () => mergeStudentsWithOverlay(serverStudents, studentOverlay),
    [serverStudents, studentOverlay],
  );

  const getParentById = useCallback(
    (parentId: string) => parents.find((p) => p.id === parentId),
    [parents],
  );

  const parentDisplayName = useCallback(
    (parentId: string) => {
      const parent = getParentById(parentId);
      return parent?.name ?? parent?.salutation ?? parentId;
    },
    [getParentById],
  );

  const upsertParent = useCallback(
    async (input: ParentInput) => {
      const row = await upsertParentAction(input);
      router.refresh();
      return {
        id: row.id,
        name: row.name,
        salutation: row.salutation,
        honorific: row.honorific,
        whatsapp: row.whatsapp ?? "",
      };
    },
    [router],
  );

  const deleteParent = useCallback(
    async (parentId: string) => {
      const result = await deleteParentAction(parentId);
      if (result.ok) router.refresh();
      return result.ok;
    },
    [router],
  );

  const upsertStudent = useCallback(
    async (input: StudentInput) => {
      const result = await upsertStudentAction(input);
      if (result.ok) {
        setStudentOverlay((prev) =>
          applyStudentUpsertOverlay(prev, result.student),
        );
        router.refresh();
      }
      return result;
    },
    [router],
  );

  const deleteStudent = useCallback(
    async (studentId: string) => {
      const result = await deleteStudentAction(studentId);
      if (result.ok) {
        setStudentOverlay((prev) =>
          applyStudentDeleteOverlay(prev, result.deletedStudentId),
        );
        router.refresh();
      }
      return result;
    },
    [router],
  );

  const value = useMemo<RosterContextValue>(
    () => ({
      parents,
      students,
      getParentById,
      parentDisplayName,
      upsertParent,
      deleteParent,
      upsertStudent,
      deleteStudent,
    }),
    [
      parents,
      students,
      getParentById,
      parentDisplayName,
      upsertParent,
      deleteParent,
      upsertStudent,
      deleteStudent,
    ],
  );

  return (
    <RosterContext.Provider value={value}>{children}</RosterContext.Provider>
  );
}

export function useRoster() {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error("useRoster must be used within RosterProvider");
  }
  return context;
}
