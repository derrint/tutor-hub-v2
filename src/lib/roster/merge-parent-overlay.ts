import type { ParentRecord } from "@/lib/domain/types";

export type ParentOverlay = {
  upserts: Record<string, ParentRecord>;
  removedIds: Set<string>;
};

export const emptyParentOverlay = (): ParentOverlay => ({
  upserts: {},
  removedIds: new Set(),
});

export function parentsMatch(a: ParentRecord, b: ParentRecord): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.salutation === b.salutation &&
    a.honorific === b.honorific &&
    a.whatsapp === b.whatsapp
  );
}

export function mergeParentsWithOverlay(
  serverParents: ParentRecord[],
  overlay: ParentOverlay,
): ParentRecord[] {
  const byId = new Map<string, ParentRecord>();

  for (const parent of serverParents) {
    if (overlay.removedIds.has(parent.id)) continue;
    byId.set(parent.id, parent);
  }

  for (const parent of Object.values(overlay.upserts)) {
    if (overlay.removedIds.has(parent.id)) continue;
    byId.set(parent.id, parent);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function reconcileParentOverlay(
  serverParents: ParentRecord[],
  overlay: ParentOverlay,
): ParentOverlay {
  let changed = false;
  const upserts = { ...overlay.upserts };
  const removedIds = new Set(overlay.removedIds);

  for (const [id, patch] of Object.entries(overlay.upserts)) {
    const server = serverParents.find((row) => row.id === id);
    if (server && parentsMatch(server, patch)) {
      delete upserts[id];
      changed = true;
    }
  }

  for (const id of overlay.removedIds) {
    if (!serverParents.some((row) => row.id === id)) {
      removedIds.delete(id);
      changed = true;
    }
  }

  if (!changed) return overlay;
  return { upserts, removedIds };
}

export function applyParentUpsertOverlay(
  overlay: ParentOverlay,
  parent: ParentRecord,
): ParentOverlay {
  const upserts = { ...overlay.upserts, [parent.id]: parent };
  const removedIds = new Set(overlay.removedIds);
  removedIds.delete(parent.id);
  return { upserts, removedIds };
}

export function applyParentDeleteOverlay(
  overlay: ParentOverlay,
  deletedParentId: string,
): ParentOverlay {
  const upserts = { ...overlay.upserts };
  delete upserts[deletedParentId];
  const removedIds = new Set(overlay.removedIds);
  removedIds.add(deletedParentId);
  return { upserts, removedIds };
}
