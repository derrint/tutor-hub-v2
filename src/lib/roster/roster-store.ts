import {
  SEED_PARENTS,
  SEED_STUDENTS,
  type MockParent,
  type Student,
} from "@/lib/mock-data";
import {
  pickNextStudentCalendarColorKey,
  resolveStudentCalendarColorKey,
} from "@/lib/students/calendar-colors";
import { normalizeHonorificStored } from "@/lib/whatsapp/format-honorific";

const STORAGE_KEY = "tutorhub-roster-state";

export type RosterState = {
  parents: MockParent[];
  students: Student[];
};

const EMPTY_STATE: RosterState = {
  parents: SEED_PARENTS,
  students: SEED_STUDENTS,
};

function normalizeStudent(student: Student): Student {
  const seedMatch = SEED_STUDENTS.find((s) => s.id === student.id);
  return {
    ...student,
    calendarColorKey: resolveStudentCalendarColorKey(
      student.calendarColorKey ?? seedMatch?.calendarColorKey,
      student.id,
    ),
  };
}

function normalizeStudents(students: Student[]): Student[] {
  return students.map(normalizeStudent);
}

function readState(): RosterState {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const record = parsed as Partial<RosterState>;
    return {
      parents: Array.isArray(record.parents)
        ? (record.parents as MockParent[]).map((p) => ({
            ...p,
            honorific: normalizeHonorificStored(p.honorific),
          }))
        : SEED_PARENTS,
      students: Array.isArray(record.students)
        ? normalizeStudents(record.students as Student[])
        : SEED_STUDENTS,
    };
  } catch {
    return EMPTY_STATE;
  }
}

let rosterState = readState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persist(next: RosterState) {
  rosterState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emitChange();
}

export function subscribeRoster(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRosterSnapshot(): RosterState {
  return rosterState;
}

const SERVER_ROSTER_SNAPSHOT: RosterState = EMPTY_STATE;

export function getRosterServerSnapshot(): RosterState {
  return SERVER_ROSTER_SNAPSHOT;
}

export function syncRosterFromStorage() {
  const stored = readState();
  if (JSON.stringify(stored) !== JSON.stringify(rosterState)) {
    rosterState = stored;
    emitChange();
  }
}

export function getParentById(parentId: string): MockParent | undefined {
  return rosterState.parents.find((p) => p.id === parentId);
}

export function parentDisplayName(parentId: string): string {
  const parent = getParentById(parentId);
  return parent?.name ?? parent?.salutation ?? parentId;
}

export function studentsLinkedToParent(parentId: string): Student[] {
  return rosterState.students.filter((s) => s.parentId === parentId);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export type ParentInput = Omit<MockParent, "id"> & { id?: string };

export function upsertParent(input: ParentInput): MockParent {
  const id = input.id ?? newId("p");
  const parent: MockParent = {
    id,
    name: input.name.trim(),
    salutation: input.salutation.trim(),
    honorific: normalizeHonorificStored(input.honorific),
    whatsapp: input.whatsapp.replace(/\D/g, ""),
  };

  const parents = [...rosterState.parents];
  const index = parents.findIndex((p) => p.id === id);
  if (index >= 0) {
    parents[index] = parent;
  } else {
    parents.push(parent);
  }

  persist({ ...rosterState, parents });
  return parent;
}

export function deleteParent(parentId: string): boolean {
  if (studentsLinkedToParent(parentId).length > 0) {
    return false;
  }
  persist({
    ...rosterState,
    parents: rosterState.parents.filter((p) => p.id !== parentId),
  });
  return true;
}

export type StudentInput = Omit<Student, "id"> & { id?: string };

export function upsertStudent(input: StudentInput): Student {
  const id = input.id ?? newId("m");
  const students = [...rosterState.students];
  const index = students.findIndex((s) => s.id === id);
  const existing = index >= 0 ? students[index] : undefined;

  const calendarColorKey =
    input.calendarColorKey ??
    existing?.calendarColorKey ??
    pickNextStudentCalendarColorKey(
      students.map((s) => s.calendarColorKey),
    );

  const student: Student = {
    id,
    name: input.name.trim(),
    age: input.age,
    level: input.level,
    feePerSession: input.feePerSession,
    status: input.status,
    parentId: input.parentId,
    calendarColorKey,
  };

  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }

  persist({ ...rosterState, students });
  return student;
}

export function deleteStudent(studentId: string): void {
  persist({
    ...rosterState,
    students: rosterState.students.filter((s) => s.id !== studentId),
  });
}
