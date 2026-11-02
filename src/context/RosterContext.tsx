"use client";

import {
  deleteParentAction,
  upsertParentAction,
  upsertStudentAction,
  deleteStudentAction,
  type DeleteParentResult,
  type DeleteStudentResult,
  type ParentInput,
  type StudentInput,
  type UpsertParentResult,
  type UpsertStudentResult,
} from "@/app/actions/roster";
import { useAdminInitial } from "@/context/AdminInitialContext";
import type { ParentRecord, StudentRecord } from "@/lib/domain/types";
import {
  applyParentDeleteOverlay,
  applyParentUpsertOverlay,
  emptyParentOverlay,
  mergeParentsWithOverlay,
  reconcileParentOverlay,
  type ParentOverlay,
} from "@/lib/roster/merge-parent-overlay";
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
  upsertParent: (input: ParentInput) => Promise<UpsertParentResult>;
  deleteParent: (parentId: string) => Promise<DeleteParentResult>;
  upsertStudent: (input: StudentInput) => Promise<UpsertStudentResult>;
  deleteStudent: (studentId: string) => Promise<DeleteStudentResult>;
};

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const {
    parents: serverParents,
    students: serverStudents,
    tutorContext,
  } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const router = useRouter();
  const [parentOverlay, setParentOverlay] = useState<ParentOverlay>(() =>
    emptyParentOverlay(),
  );
  const [studentOverlay, setStudentOverlay] = useState<StudentOverlay>(() =>
    emptyStudentOverlay(),
  );

  useEffect(() => {
    setParentOverlay(emptyParentOverlay());
    setStudentOverlay(emptyStudentOverlay());
  }, [activeTutorId]);

  useEffect(() => {
    setParentOverlay((prev) =>
      reconcileParentOverlay(serverParents, prev),
    );
  }, [serverParents]);

  useEffect(() => {
    setStudentOverlay((prev) =>
      reconcileStudentOverlay(serverStudents, prev),
    );
  }, [serverStudents]);

  const parents = useMemo(
    () => mergeParentsWithOverlay(serverParents, parentOverlay),
    [serverParents, parentOverlay],
  );

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
      const result = await upsertParentAction(input);
      if (result.ok) {
        setParentOverlay((prev) =>
          applyParentUpsertOverlay(prev, result.parent),
        );
        router.refresh();
      }
      return result;
    },
    [router],
  );

  const deleteParent = useCallback(
    async (parentId: string) => {
      const result = await deleteParentAction(parentId);
      if (result.ok) {
        setParentOverlay((prev) =>
          applyParentDeleteOverlay(prev, result.deletedParentId),
        );
        router.refresh();
      }
      return result;
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
