"use client";

import {
  deleteParentAction,
  upsertParentAction,
  upsertStudentAction,
  deleteStudentAction,
  type ParentInput,
  type StudentInput,
} from "@/app/actions/roster";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import type { ParentRecord, StudentRecord } from "@/lib/domain/types";
import { useRouter } from "@/i18n/navigation";
import React, { createContext, useCallback, useContext, useMemo } from "react";

type RosterContextValue = {
  parents: ParentRecord[];
  students: StudentRecord[];
  getParentById: (parentId: string) => ParentRecord | undefined;
  parentDisplayName: (parentId: string) => string;
  upsertParent: (input: ParentInput) => Promise<ParentRecord>;
  deleteParent: (parentId: string) => Promise<boolean>;
  upsertStudent: (input: StudentInput) => Promise<StudentRecord>;
  deleteStudent: (studentId: string) => Promise<void>;
};

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const { parents, students } = useAdminBootstrap();
  const router = useRouter();

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
      const row = await upsertStudentAction(input);
      router.refresh();
      return {
        id: row.id,
        name: row.name,
        age: row.age ?? 0,
        level: row.level,
        feePerSession: row.feePerSession,
        status: row.status,
        parentId: row.parentId ?? "",
        calendarColorKey:
          row.calendarColorKey as StudentRecord["calendarColorKey"],
      };
    },
    [router],
  );

  const deleteStudent = useCallback(
    async (studentId: string) => {
      await deleteStudentAction(studentId);
      router.refresh();
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
