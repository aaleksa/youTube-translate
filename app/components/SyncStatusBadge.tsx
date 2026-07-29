'use client';

import { useSyncExternalStore } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  getSyncStatusState,
  subscribeSyncStatus,
  type SyncStatusState,
} from '../lib/v2/syncStatus';
import { useAuth } from './auth/AuthProvider';
import { useI18n } from './InterfaceLanguageProvider';

type BadgeState = 'offline' | 'syncing' | 'pending' | 'synced';

function subscribe(callback: () => void): () => void {
  return subscribeSyncStatus(callback);
}

function getSnapshot(): ReturnType<typeof getSyncStatusState> {
  return getSyncStatusState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
}

export default function SyncStatusBadge() {
  const online = useOnlineStatus();
  const { enabled, ready, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const syncState = useSyncExternalStore<SyncStatusState>(
    subscribe,
    getSnapshot,
    () => 'idle'
  );

  if (!enabled || !ready || !isAuthenticated) {
    return null;
  }

  const state: BadgeState = !online
    ? 'offline'
    : syncState === 'syncing'
      ? 'syncing'
      : syncState === 'pending'
        ? 'pending'
        : 'synced';

  const labelKey =
    state === 'offline'
      ? 'sync.statusOffline'
      : state === 'syncing'
        ? 'sync.statusSyncing'
        : state === 'pending'
          ? 'sync.statusPending'
          : 'sync.statusSynced';

  const dotClass =
    state === 'offline'
      ? 'bg-amber-500'
      : state === 'syncing'
        ? 'bg-blue-500 animate-pulse'
        : state === 'pending'
          ? 'bg-slate-400'
          : 'bg-emerald-500';

  const label = t(labelKey);

  return (
    <span
      role="status"
      data-testid="sync-status-badge"
      data-sync-state={state}
      className="inline-flex h-9 max-w-[9.5rem] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium text-gray-600 dark:text-gray-300"
      title={label}
    >
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}
