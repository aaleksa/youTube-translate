export type SyncConflictEntity =
  | 'flashcard'
  | 'settings'
  | 'dailyStudy'
  | 'quizResults';

export interface SyncConflict {
  id: string;
  entityType: SyncConflictEntity;
  label: string;
  strategy: 'merged';
}

type Listener = () => void;

const MAX_CONFLICTS = 20;
let conflicts: SyncConflict[] = [];
let dismissed = false;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeSyncConflicts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordSyncConflict(conflict: SyncConflict): void {
  if (dismissed) {
    dismissed = false;
  }

  if (conflicts.some((item) => item.id === conflict.id && item.entityType === conflict.entityType)) {
    return;
  }

  conflicts = [conflict, ...conflicts].slice(0, MAX_CONFLICTS);
  notify();
}

export function getSyncConflicts(): SyncConflict[] {
  return conflicts;
}

export function getSyncConflictCount(): number {
  return dismissed ? 0 : conflicts.length;
}

export function dismissSyncConflicts(): void {
  dismissed = true;
  notify();
}

export function resetSyncConflicts(): void {
  conflicts = [];
  dismissed = false;
  notify();
}
