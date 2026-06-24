'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import AppSettingsPanel from './AppSettingsPanel';
import { AppProviders } from './AppProviders';
import AuthButton from './auth/AuthButton';
import AuthPanel from './auth/AuthPanel';
import PremiumStatus from './premium/PremiumStatus';
import { useAuth } from './auth/AuthProvider';
import InstallAppButton from './InstallAppButton';
import OfflineStatusBanner from './OfflineStatusBanner';
import SyncConflictBanner from './SyncConflictBanner';
import SyncStatusBadge from './SyncStatusBadge';
import PremiumCheckoutReturn from './premium/PremiumCheckoutReturn';
import { useI18n } from './InterfaceLanguageProvider';
import ThemeToggle from './ThemeToggle';

function AuthenticatedMain({ children }: { children: ReactNode }) {
  const { enabled, ready, isAuthenticated, openAuth } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (enabled && ready && !isAuthenticated) {
      openAuth('login');
    }
  }, [enabled, ready, isAuthenticated, openAuth]);

  if (!enabled) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-gray-400">{t('auth.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('auth.loginRequiredTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.loginRequiredHint')}
          </p>
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppShellChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]">
        <PremiumStatus />
        <SyncStatusBadge />
        <AuthButton />
        <InstallAppButton />
        <AppSettingsPanel />
        <ThemeToggle />
      </div>
      <OfflineStatusBanner />
      <SyncConflictBanner />
      <PremiumCheckoutReturn />
      <AuthPanel />
      <AuthenticatedMain>{children}</AuthenticatedMain>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <AppShellChrome>{children}</AppShellChrome>
    </AppProviders>
  );
}
