import type { StudentRecord } from "@/lib/domain/types";

export type StudentOverlay = {
  upserts: Record<string, StudentRecord>;
  removedIds: Set<string>;
};

export const emptyStudentOverlay = (): StudentOverlay => ({
  upserts: {},
  removedIds: new Set(),
});

export function studentsMatch(a: StudentRecord, b: StudentRecord): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.age === b.age &&
    a.level === b.level &&
    a.feePerSession === b.feePerSession &&
    a.status === b.status &&
    a.parentId === b.parentId &&
    a.calendarColorKey === b.calendarColorKey
  );
}

export function mergeStudentsWithOverlay(
  serverStudents: StudentRecord[],
  overlay: StudentOverlay,
): StudentRecord[] {
  const byId = new Map<string, StudentRecord>();

  for (const student of serverStudents) {
    if (overlay.removedIds.has(student.id)) continue;
    byId.set(student.id, student);
  }

  for (const student of Object.values(overlay.upserts)) {
    if (overlay.removedIds.has(student.id)) continue;
    byId.set(student.id, student);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function reconcileStudentOverlay(
  serverStudents: StudentRecord[],
  overlay: StudentOverlay,
): StudentOverlay {
  let changed = false;
  const upserts = { ...overlay.upserts };
  const removedIds = new Set(overlay.removedIds);

  for (const [id, patch] of Object.entries(overlay.upserts)) {
    const server = serverStudents.find((row) => row.id === id);
    if (server && studentsMatch(server, patch)) {
      delete upserts[id];
      changed = true;
    }
  }

  for (const id of overlay.removedIds) {
    if (!serverStudents.some((row) => row.id === id)) {
      removedIds.delete(id);
      changed = true;
    }
  }

  if (!changed) return overlay;
  return { upserts, removedIds };
}

export function applyStudentUpsertOverlay(
  overlay: StudentOverlay,
  student: StudentRecord,
): StudentOverlay {
  const upserts = { ...overlay.upserts, [student.id]: student };
  const removedIds = new Set(overlay.removedIds);
  removedIds.delete(student.id);
  return { upserts, removedIds };
}

export function applyStudentDeleteOverlay(
  overlay: StudentOverlay,
  deletedStudentId: string,
): StudentOverlay {
  const upserts = { ...overlay.upserts };
  delete upserts[deletedStudentId];
  const removedIds = new Set(overlay.removedIds);
  removedIds.add(deletedStudentId);
  return { upserts, removedIds };
}
