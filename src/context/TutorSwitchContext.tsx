"use client";

import { useAdminInitial } from "@/context/AdminInitialContext";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TutorSwitchContextValue = {
  switchTargetId: string | null;
  isSwitchingTutor: boolean;
  beginTutorSwitch: (tutorId: string) => void;
  cancelTutorSwitch: () => void;
};

const TutorSwitchContext = createContext<TutorSwitchContextValue | null>(null);

/** Tracks admin tutor switch until server `activeTutorId` matches the selected practice. */
export function TutorSwitchProvider({ children }: { children: React.ReactNode }) {
  const { tutorContext } = useAdminInitial();
  const activeTutorId = tutorContext.activeTutorId;
  const [switchTargetId, setSwitchTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (switchTargetId && activeTutorId === switchTargetId) {
      setSwitchTargetId(null);
    }
  }, [activeTutorId, switchTargetId]);

  const beginTutorSwitch = useCallback((tutorId: string) => {
    setSwitchTargetId(tutorId);
  }, []);

  const cancelTutorSwitch = useCallback(() => {
    setSwitchTargetId(null);
  }, []);

  const value = useMemo(
    () => ({
      switchTargetId,
      isSwitchingTutor: switchTargetId != null,
      beginTutorSwitch,
      cancelTutorSwitch,
    }),
    [switchTargetId, beginTutorSwitch, cancelTutorSwitch],
  );

  return (
    <TutorSwitchContext.Provider value={value}>
      {children}
    </TutorSwitchContext.Provider>
  );
}

export function useTutorSwitch() {
  const context = useContext(TutorSwitchContext);
  if (!context) {
    throw new Error("useTutorSwitch must be used within TutorSwitchProvider");
  }
  return context;
}
