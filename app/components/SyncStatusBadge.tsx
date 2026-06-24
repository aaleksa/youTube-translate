'use client';

import { useSyncExternalStore } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  getSyncStatusState,
  subscribeSyncStatus,
} from '../lib/v2/syncStatus';
import { useAuth } from './auth/AuthProvider';
import { useI18n } from './InterfaceLanguageProvider';

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
  const syncState = useSyncExternalStore(subscribe, getSnapshot, () => 'idle');

  if (!enabled || !ready || !isAuthenticated) {
    return null;
  }

  const state = online ? syncState : 'offline';

  if (state === 'idle') {
    return null;
  }

  const labelKey =
    state === 'offline'
      ? 'sync.statusOffline'
      : state === 'syncing'
        ? 'sync.statusSyncing'
        : 'sync.statusPending';

  const className =
    state === 'offline'
      ? 'border-amber-300/80 bg-amber-50/95 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/90 dark:text-amber-100'
      : state === 'syncing'
        ? 'border-blue-300/80 bg-blue-50/95 text-blue-950 dark:border-blue-500/40 dark:bg-blue-950/90 dark:text-blue-100'
        : 'border-slate-300/80 bg-slate-50/95 text-slate-800 dark:border-slate-500/40 dark:bg-slate-900/90 dark:text-slate-100';

  return (
    <span
      role="status"
      data-testid="sync-status-badge"
      data-sync-state={state}
      className={`inline-flex max-w-[9rem] items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight backdrop-blur ${className}`}
      title={t(labelKey)}
    >
      {t(labelKey)}
    </span>
  );
}
