"use client";

import {
  setOccurrenceAbsentAction,
  toggleOccurrenceAbsentAction,
} from "@/app/actions/attendance";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

type AttendanceContextValue = {
  absentOccurrenceIds: ReadonlySet<string>;
  isAbsent: (occurrenceId: string) => boolean;
  markAbsent: (occurrenceId: string) => Promise<void>;
  markBillable: (occurrenceId: string) => Promise<void>;
  toggleAbsent: (occurrenceId: string) => Promise<void>;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { absentOccurrenceIds } = useAdminBootstrap();
  const router = useRouter();

  const absentSet = useMemo(
    () => new Set(absentOccurrenceIds),
    [absentOccurrenceIds],
  );

  const isAbsent = useCallback(
    (occurrenceId: string) => absentSet.has(occurrenceId),
    [absentSet],
  );

  const markAbsent = useCallback(
    async (occurrenceId: string) => {
      await setOccurrenceAbsentAction(occurrenceId, true);
      router.refresh();
    },
    [router],
  );

  const markBillable = useCallback(
    async (occurrenceId: string) => {
      await setOccurrenceAbsentAction(occurrenceId, false);
      router.refresh();
    },
    [router],
  );

  const toggleAbsent = useCallback(
    async (occurrenceId: string) => {
      await toggleOccurrenceAbsentAction(occurrenceId);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<AttendanceContextValue>(
    () => ({
      absentOccurrenceIds: absentSet,
      isAbsent,
      markAbsent,
      markBillable,
      toggleAbsent,
    }),
    [absentSet, isAbsent, markAbsent, markBillable, toggleAbsent],
  );

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
}
