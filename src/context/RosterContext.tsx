"use client";

import type { MockParent, Student } from "@/lib/mock-data";
import {
  deleteParent,
  deleteStudent,
  getRosterServerSnapshot,
  getRosterSnapshot,
  parentDisplayName,
  subscribeRoster,
  syncRosterFromStorage,
  upsertParent,
  upsertStudent,
  type ParentInput,
  type StudentInput,
} from "@/lib/roster/roster-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type RosterContextValue = {
  parents: MockParent[];
  students: Student[];
  getParentById: (id: string) => MockParent | undefined;
  parentDisplayName: (parentId: string) => string;
  upsertParent: (input: ParentInput) => MockParent;
  deleteParent: (parentId: string) => boolean;
  upsertStudent: (input: StudentInput) => Student;
  deleteStudent: (studentId: string) => void;
};

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const roster = useSyncExternalStore(
    subscribeRoster,
    getRosterSnapshot,
    getRosterServerSnapshot,
  );

  useEffect(() => {
    syncRosterFromStorage();
  }, []);

  const value = useMemo<RosterContextValue>(
    () => ({
      parents: roster.parents,
      students: roster.students,
      getParentById: (id) => roster.parents.find((p) => p.id === id),
      parentDisplayName,
      upsertParent,
      deleteParent,
      deleteStudent,
      upsertStudent,
    }),
    [roster.parents, roster.students],
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
