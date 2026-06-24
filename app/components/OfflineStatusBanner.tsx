'use client';

import { isBackendV2Enabled } from '../lib/v2/config';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from './auth/AuthProvider';
import { useI18n } from './InterfaceLanguageProvider';

export default function OfflineStatusBanner() {
  const online = useOnlineStatus();
  const { enabled, ready, isAuthenticated } = useAuth();
  const { t } = useI18n();

  if (online || !enabled || !ready || !isAuthenticated || !isBackendV2Enabled()) {
    return null;
  }

  return (
    <div
      role="status"
      data-testid="offline-v2-banner"
      className="fixed top-[calc(env(safe-area-inset-top)+3.25rem)] left-3 right-3 z-40 mx-auto max-w-3xl rounded-lg border border-amber-300/80 bg-amber-50/95 px-3 py-2 text-sm text-amber-950 shadow-md backdrop-blur dark:border-amber-500/40 dark:bg-amber-950/90 dark:text-amber-100"
    >
      <p className="font-medium">{t('offline.v2Title')}</p>
      <p className="mt-0.5 text-xs leading-relaxed opacity-90">
        {t('offline.v2Hint')}
      </p>
    </div>
  );
}
