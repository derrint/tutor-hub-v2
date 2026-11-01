"use client";

import {
  deleteRecurringSessionAction,
  upsertRecurringSessionAction,
  type DeleteRecurringSessionResult,
  type RecurringSessionInput,
  type UpsertRecurringSessionResult,
} from "@/app/actions/schedule";
import { useAdminInitial } from "@/context/AdminInitialContext";
import type { RecurringSession } from "@/lib/domain/types";
import {
  applyDeleteOverlayPatch,
  applyUpsertOverlayPatch,
  emptyRecurringSessionOverlay,
  mergeRecurringSessionsWithOverlay,
  reconcileRecurringSessionOverlay,
  type RecurringSessionOverlay,
} from "@/lib/schedule/merge-recurring-session-overlay";
import { useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ScheduleContextValue = {
  recurringSessions: RecurringSession[];
  upsertRecurringSession: (
    input: RecurringSessionInput,
  ) => Promise<UpsertRecurringSessionResult>;
  deleteRecurringSession: (
    ruleId: string,
  ) => Promise<DeleteRecurringSessionResult>;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { recurringSessions: serverRecurringSessions, tutorContext } =
    useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const router = useRouter();
  const [overlay, setOverlay] = useState<RecurringSessionOverlay>(() =>
    emptyRecurringSessionOverlay(),
  );

  useEffect(() => {
    setOverlay(emptyRecurringSessionOverlay());
  }, [activeTutorId]);

  useEffect(() => {
    setOverlay((prev) =>
      reconcileRecurringSessionOverlay(serverRecurringSessions, prev),
    );
  }, [serverRecurringSessions]);

  const recurringSessions = useMemo(
    () =>
      mergeRecurringSessionsWithOverlay(serverRecurringSessions, overlay),
    [serverRecurringSessions, overlay],
  );

  const upsertRecurringSession = useCallback(
    async (input: RecurringSessionInput) => {
      const result = await upsertRecurringSessionAction(input);
      if (result.ok) {
        setOverlay((prev) =>
          applyUpsertOverlayPatch(
            prev,
            result.session,
            result.previousRuleId,
          ),
        );
        router.refresh();
      }
      return result;
    },
    [router],
  );

  const deleteRecurringSession = useCallback(
    async (ruleId: string) => {
      const result = await deleteRecurringSessionAction(ruleId);
      if (result.ok) {
        setOverlay((prev) =>
          applyDeleteOverlayPatch(prev, result.deletedRuleId),
        );
        router.refresh();
      }
      return result;
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
