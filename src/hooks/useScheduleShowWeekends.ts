"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "tutorhub-schedule-show-weekends";

function readStoredShowWeekends(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // ignore
  }
  return false;
}

/** Default false = Mon–Fri only (FullCalendar `weekends: false`). */
export function useScheduleShowWeekends() {
  const [showWeekends, setShowWeekendsState] = useState(readStoredShowWeekends);

  const setShowWeekends = useCallback((value: boolean) => {
    setShowWeekendsState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  }, []);

  return { showWeekends, setShowWeekends };
}
