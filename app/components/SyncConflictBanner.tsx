'use client';

import { useSyncExternalStore } from 'react';
import {
  dismissSyncConflicts,
  getSyncConflictCount,
  subscribeSyncConflicts,
} from '../lib/v2/syncConflicts';
import { useI18n } from './InterfaceLanguageProvider';
import { useAuth } from './auth/AuthProvider';

function subscribe(callback: () => void): () => void {
  return subscribeSyncConflicts(callback);
}

function getSnapshot(): number {
  return getSyncConflictCount();
}

export default function SyncConflictBanner() {
  const { enabled, ready, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const conflictCount = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  if (!enabled || !ready || !isAuthenticated || conflictCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      data-testid="sync-conflict-banner"
      className="fixed top-0 inset-x-0 z-[60] border-b border-amber-300/80 bg-amber-50/95 px-4 py-2 text-sm text-amber-950 shadow-sm backdrop-blur dark:border-amber-500/40 dark:bg-amber-950/90 dark:text-amber-100 pt-[max(0.5rem,env(safe-area-inset-top))]"
    >
      <div className="mx-auto flex max-w-5xl items-start justify-between gap-3">
        <div>
          <p className="font-medium">{t('sync.conflictTitle')}</p>
          <p className="text-xs sm:text-sm opacity-90">
            {t('sync.conflictBody', { count: conflictCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dismissSyncConflicts()}
          className="shrink-0 rounded-md border border-amber-300/80 px-2.5 py-1 text-xs font-medium hover:bg-amber-100/80 dark:border-amber-500/40 dark:hover:bg-amber-900/40"
        >
          {t('sync.conflictDismiss')}
        </button>
      </div>
    </div>
  );
}
