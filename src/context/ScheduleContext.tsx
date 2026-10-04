"use client";

import type { RecurringSession } from "@/lib/mock-data";
import {
  getScheduleServerSnapshot,
  getScheduleSnapshot,
  subscribeSchedule,
  syncScheduleFromStorage,
  upsertRecurringSession,
  type RecurringSessionInput,
} from "@/lib/schedule/schedule-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type ScheduleContextValue = {
  recurringSessions: RecurringSession[];
  upsertRecurringSession: (
    input: RecurringSessionInput,
  ) => RecurringSession | null;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const schedule = useSyncExternalStore(
    subscribeSchedule,
    getScheduleSnapshot,
    getScheduleServerSnapshot,
  );

  useEffect(() => {
    syncScheduleFromStorage();
  }, []);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      recurringSessions: schedule.recurringSessions,
      upsertRecurringSession,
    }),
    [schedule.recurringSessions],
  );

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within ScheduleProvider");
  }
  return context;
}
