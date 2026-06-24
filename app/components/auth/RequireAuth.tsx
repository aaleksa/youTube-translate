'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useI18n } from '../InterfaceLanguageProvider';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
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
