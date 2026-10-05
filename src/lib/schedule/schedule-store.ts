import {
  SEED_RECURRING_SESSIONS,
  type EducationLevel,
  type RecurringSession,
} from "@/lib/mock-data";
import { getRosterSnapshot } from "@/lib/roster/roster-store";

const STORAGE_KEY = "tutorhub-schedule-recurring";

export type ScheduleState = {
  recurringSessions: RecurringSession[];
};

const EMPTY_STATE: ScheduleState = {
  recurringSessions: SEED_RECURRING_SESSIONS,
};

function readState(): ScheduleState {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const record = parsed as Partial<ScheduleState>;
    return {
      recurringSessions: Array.isArray(record.recurringSessions)
        ? (record.recurringSessions as RecurringSession[])
        : SEED_RECURRING_SESSIONS,
    };
  } catch {
    return EMPTY_STATE;
  }
}

let scheduleState = readState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persist(next: ScheduleState) {
  scheduleState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emitChange();
}

export function subscribeSchedule(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getScheduleSnapshot(): ScheduleState {
  return scheduleState;
}

const SERVER_SCHEDULE_SNAPSHOT: ScheduleState = EMPTY_STATE;

export function getScheduleServerSnapshot(): ScheduleState {
  return SERVER_SCHEDULE_SNAPSHOT;
}

export function syncScheduleFromStorage() {
  const stored = readState();
  if (JSON.stringify(stored) !== JSON.stringify(scheduleState)) {
    scheduleState = stored;
    emitChange();
  }
}

function newRuleId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function resolveStudentFields(studentId: string): {
  studentName: string;
  level: EducationLevel;
} | null {
  const student = getRosterSnapshot().students.find((s) => s.id === studentId);
  if (!student) return null;
  return { studentName: student.name, level: student.level };
}

export type RecurringSessionInput = {
  id?: string;
  studentId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

export function upsertRecurringSession(
  input: RecurringSessionInput,
): RecurringSession | null {
  const fields = resolveStudentFields(input.studentId);
  if (!fields) return null;

  const session: RecurringSession = {
    id: input.id ?? newRuleId(),
    studentId: input.studentId,
    studentName: fields.studentName,
    level: fields.level,
    daysOfWeek: [...input.daysOfWeek].sort((a, b) => a - b),
    startTime: input.startTime,
    endTime: input.endTime,
  };

  const recurringSessions = [...scheduleState.recurringSessions];
  const index = recurringSessions.findIndex((r) => r.id === session.id);
  if (index >= 0) {
    recurringSessions[index] = session;
  } else {
    recurringSessions.push(session);
  }

  persist({ recurringSessions });
  return session;
}

export function deleteRecurringSession(ruleId: string): boolean {
  const next = scheduleState.recurringSessions.filter((r) => r.id !== ruleId);
  if (next.length === scheduleState.recurringSessions.length) {
    return false;
  }
  persist({ recurringSessions: next });
  return true;
}

/** Refresh denormalized student names/levels from roster (after student rename). */
export function refreshRecurringSessionLabels(): void {
  const recurringSessions = scheduleState.recurringSessions.map((rule) => {
    const fields = resolveStudentFields(rule.studentId);
    if (!fields) return rule;
    return {
      ...rule,
      studentName: fields.studentName,
      level: fields.level,
    };
  });
  persist({ recurringSessions });
}
