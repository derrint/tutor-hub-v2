"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "tutorhub-absent-occurrences";

type AttendanceContextValue = {
  absentOccurrenceIds: ReadonlySet<string>;
  isAbsent: (occurrenceId: string) => boolean;
  markAbsent: (occurrenceId: string) => void;
  markBillable: (occurrenceId: string) => void;
  toggleAbsent: (occurrenceId: string) => void;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

function readAbsentIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string"));
  } catch {
    return new Set();
  }
}

let absentIds = readAbsentIds();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persist(next: Set<string>) {
  absentIds = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return absentIds;
}

/** Stable empty set — React requires getServerSnapshot to return a cached reference. */
const SERVER_ABSENT_SNAPSHOT = new Set<string>();

function getServerSnapshot() {
  return SERVER_ABSENT_SNAPSHOT;
}

function setsEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const absentOccurrenceIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const stored = readAbsentIds();
    if (!setsEqual(stored, absentIds)) {
      absentIds = stored;
      emitChange();
    }
  }, []);

  const isAbsent = useCallback(
    (occurrenceId: string) => absentOccurrenceIds.has(occurrenceId),
    [absentOccurrenceIds],
  );

  const markAbsent = useCallback((occurrenceId: string) => {
    const next = new Set(absentIds);
    next.add(occurrenceId);
    persist(next);
  }, []);

  const markBillable = useCallback((occurrenceId: string) => {
    const next = new Set(absentIds);
    next.delete(occurrenceId);
    persist(next);
  }, []);

  const toggleAbsent = useCallback((occurrenceId: string) => {
    const next = new Set(absentIds);
    if (next.has(occurrenceId)) {
      next.delete(occurrenceId);
    } else {
      next.add(occurrenceId);
    }
    persist(next);
  }, []);

  const value = useMemo(
    () => ({
      absentOccurrenceIds,
      isAbsent,
      markAbsent,
      markBillable,
      toggleAbsent,
    }),
    [absentOccurrenceIds, isAbsent, markAbsent, markBillable, toggleAbsent],
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
