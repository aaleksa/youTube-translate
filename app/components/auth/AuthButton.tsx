'use client';

import { useAuth } from './AuthProvider';
import { useI18n } from '../InterfaceLanguageProvider';

const topBarButtonClass =
  'px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-md text-sm font-medium';

export default function AuthButton() {
  const { t } = useI18n();
  const { enabled, ready, user, isAuthenticated, openAuth, logout } = useAuth();

  if (!enabled || !ready) return null;

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-200 max-w-[10rem] truncate">
          {user.email}
        </span>
        <button type="button" onClick={() => void logout()} className={topBarButtonClass}>
          {t('auth.logout')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAuth('login')}
      className={topBarButtonClass}
    >
      {t('auth.login')}
    </button>
  );
}
