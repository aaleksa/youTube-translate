export type SyncStatusState = 'idle' | 'syncing' | 'pending' | 'offline';

type Listener = () => void;

let bootstrapActive = false;
let pendingFlashcardSyncs = 0;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeSyncStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setBootstrapSyncActive(active: boolean): void {
  if (bootstrapActive === active) return;
  bootstrapActive = active;
  notify();
}

export function setPendingFlashcardSyncCount(count: number): void {
  if (pendingFlashcardSyncs === count) return;
  pendingFlashcardSyncs = count;
  notify();
}

export function getSyncStatusState(online: boolean): SyncStatusState {
  if (!online) return 'offline';
  if (bootstrapActive) return 'syncing';
  if (pendingFlashcardSyncs > 0) return 'pending';
  return 'idle';
}

export function getPendingFlashcardSyncCount(): number {
  return pendingFlashcardSyncs;
}
