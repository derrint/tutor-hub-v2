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
  useEffect,
  useMemo,
  useState,
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
  const { absentOccurrenceIds: serverAbsentIds } = useAdminBootstrap();
  const router = useRouter();
  const [localAbsentOverrides, setLocalAbsentOverrides] = useState<
    Map<string, boolean>
  >(() => new Map());

  useEffect(() => {
    setLocalAbsentOverrides((prev) => {
      if (prev.size === 0) return prev;
      const next = new Map(prev);
      for (const [occurrenceId, absent] of prev) {
        const onServer = serverAbsentIds.includes(occurrenceId);
        if (onServer === absent) {
          next.delete(occurrenceId);
        }
      }
      return next.size === prev.size ? prev : next;
    });
  }, [serverAbsentIds]);

  const absentSet = useMemo(() => {
    const set = new Set(serverAbsentIds);
    for (const [occurrenceId, absent] of localAbsentOverrides) {
      if (absent) set.add(occurrenceId);
      else set.delete(occurrenceId);
    }
    return set;
  }, [serverAbsentIds, localAbsentOverrides]);

  const applyOptimistic = useCallback((occurrenceId: string, absent: boolean) => {
    setLocalAbsentOverrides((prev) => {
      const next = new Map(prev);
      next.set(occurrenceId, absent);
      return next;
    });
  }, []);

  const revertOptimistic = useCallback((occurrenceId: string) => {
    setLocalAbsentOverrides((prev) => {
      if (!prev.has(occurrenceId)) return prev;
      const next = new Map(prev);
      next.delete(occurrenceId);
      return next;
    });
  }, []);

  const isAbsent = useCallback(
    (occurrenceId: string) => absentSet.has(occurrenceId),
    [absentSet],
  );

  const markAbsent = useCallback(
    async (occurrenceId: string) => {
      applyOptimistic(occurrenceId, true);
      try {
        await setOccurrenceAbsentAction(occurrenceId, true);
      } catch {
        revertOptimistic(occurrenceId);
        router.refresh();
      }
    },
    [applyOptimistic, revertOptimistic, router],
  );

  const markBillable = useCallback(
    async (occurrenceId: string) => {
      applyOptimistic(occurrenceId, false);
      try {
        await setOccurrenceAbsentAction(occurrenceId, false);
      } catch {
        revertOptimistic(occurrenceId);
        router.refresh();
      }
    },
    [applyOptimistic, revertOptimistic, router],
  );

  const toggleAbsent = useCallback(
    async (occurrenceId: string) => {
      const nextAbsent = !isAbsent(occurrenceId);
      applyOptimistic(occurrenceId, nextAbsent);
      try {
        await toggleOccurrenceAbsentAction(occurrenceId);
      } catch {
        revertOptimistic(occurrenceId);
        router.refresh();
      }
    },
    [applyOptimistic, isAbsent, revertOptimistic, router],
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
