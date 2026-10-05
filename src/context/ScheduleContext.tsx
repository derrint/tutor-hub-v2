"use client";

import {
  deleteRecurringSessionAction,
  upsertRecurringSessionAction,
  type RecurringSessionInput,
} from "@/app/actions/schedule";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import type { RecurringSession } from "@/lib/domain/types";
import { useRouter } from "@/i18n/navigation";
import React, { createContext, useCallback, useContext, useMemo } from "react";

type ScheduleContextValue = {
  recurringSessions: RecurringSession[];
  upsertRecurringSession: (
    input: RecurringSessionInput,
  ) => Promise<RecurringSession | null>;
  deleteRecurringSession: (ruleId: string) => Promise<boolean>;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { recurringSessions } = useAdminBootstrap();
  const router = useRouter();

  const upsertRecurringSession = useCallback(
    async (input: RecurringSessionInput) => {
      const anchorId = await upsertRecurringSessionAction(input);
      router.refresh();
      if (!anchorId) return null;
      const existing =
        recurringSessions.find((s) => s.id === anchorId) ??
        recurringSessions.find((s) => s.id === input.id);
      return (
        existing ?? {
          id: anchorId,
          studentId: input.studentId,
          studentName: "",
          level: "TK",
          daysOfWeek: input.daysOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
        }
      );
    },
    [router, recurringSessions],
  );

  const deleteRecurringSession = useCallback(
    async (ruleId: string) => {
      const ok = await deleteRecurringSessionAction(ruleId);
      if (ok) router.refresh();
      return ok;
    },
    [router],
  );

  const value = useMemo<ScheduleContextValue>(
    () => ({
      recurringSessions,
      upsertRecurringSession,
      deleteRecurringSession,
    }),
    [recurringSessions, upsertRecurringSession, deleteRecurringSession],
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

export type { RecurringSessionInput };
