"use client";

import { getTutorCalendarParts } from "@/lib/datetime/tutor-calendar";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

function tutorDayKey(reference: Date = new Date()): string {
  const { year, month, day } = getTutorCalendarParts(reference);
  return `${year}-${month}-${day}`;
}

/** Refetch server bootstrap when WIB calendar day changes (midnight, open tabs). */
export function useTutorDayRolloverRefresh(): void {
  const router = useRouter();
  const dayKeyRef = useRef(tutorDayKey());

  useEffect(() => {
    const check = () => {
      const next = tutorDayKey();
      if (next === dayKeyRef.current) return;
      dayKeyRef.current = next;
      router.refresh();
    };

    const intervalId = window.setInterval(check, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);
}
