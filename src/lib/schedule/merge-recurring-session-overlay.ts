import type { RecurringSession } from "@/lib/domain/types";
import { recurringSessionsMatch } from "@/lib/schedule/map-recurring-session";

export type RecurringSessionOverlay = {
  upserts: Record<string, RecurringSession>;
  removedIds: Set<string>;
};

export const emptyRecurringSessionOverlay = (): RecurringSessionOverlay => ({
  upserts: {},
  removedIds: new Set(),
});

export function mergeRecurringSessionsWithOverlay(
  serverSessions: RecurringSession[],
  overlay: RecurringSessionOverlay,
): RecurringSession[] {
  const byId = new Map<string, RecurringSession>();

  for (const session of serverSessions) {
    if (overlay.removedIds.has(session.id)) continue;
    byId.set(session.id, session);
  }

  for (const session of Object.values(overlay.upserts)) {
    if (overlay.removedIds.has(session.id)) continue;
    byId.set(session.id, session);
  }

  return [...byId.values()].sort((a, b) =>
    a.studentName.localeCompare(b.studentName),
  );
}

/** Drop overlay entries once server data matches (after `router.refresh`). */
export function reconcileRecurringSessionOverlay(
  serverSessions: RecurringSession[],
  overlay: RecurringSessionOverlay,
): RecurringSessionOverlay {
  let changed = false;
  const upserts = { ...overlay.upserts };
  const removedIds = new Set(overlay.removedIds);

  for (const [id, patch] of Object.entries(overlay.upserts)) {
    const server = serverSessions.find((row) => row.id === id);
    if (server && recurringSessionsMatch(server, patch)) {
      delete upserts[id];
      changed = true;
    }
  }

  for (const id of overlay.removedIds) {
    if (!serverSessions.some((row) => row.id === id)) {
      removedIds.delete(id);
      changed = true;
    }
  }

  if (!changed) return overlay;
  return { upserts, removedIds };
}

export function applyUpsertOverlayPatch(
  overlay: RecurringSessionOverlay,
  session: RecurringSession,
  previousRuleId?: string,
): RecurringSessionOverlay {
  const upserts = { ...overlay.upserts };
  const removedIds = new Set(overlay.removedIds);

  if (previousRuleId) {
    removedIds.add(previousRuleId);
    delete upserts[previousRuleId];
  }

  removedIds.delete(session.id);
  upserts[session.id] = session;

  return { upserts, removedIds };
}

export function applyDeleteOverlayPatch(
  overlay: RecurringSessionOverlay,
  deletedRuleId: string,
): RecurringSessionOverlay {
  const upserts = { ...overlay.upserts };
  delete upserts[deletedRuleId];
  const removedIds = new Set(overlay.removedIds);
  removedIds.add(deletedRuleId);
  return { upserts, removedIds };
}
