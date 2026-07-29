'use client';

import { useAuth } from './AuthProvider';
import { useI18n } from '../InterfaceLanguageProvider';
import { topBarTextButton } from '../topBarStyles';

export default function AuthButton() {
  const { t } = useI18n();
  const { enabled, ready, user, isAuthenticated, openAuth, logout } = useAuth();

  if (!enabled || !ready) return null;

  if (isAuthenticated && user) {
    return (
      <div className="inline-flex h-9 max-w-[16rem] items-center overflow-hidden rounded-full border border-gray-200/80 bg-gray-50/90 dark:border-gray-600 dark:bg-gray-800/80">
        <span
          data-testid="auth-user-email"
          className="hidden min-w-0 max-w-[10rem] truncate px-2.5 text-xs text-gray-600 dark:text-gray-300 sm:inline"
          title={user.email}
        >
          {user.email}
        </span>
        <span
          aria-hidden="true"
          className="hidden h-4 w-px bg-gray-300/80 dark:bg-gray-600 sm:block"
        />
        <button
          type="button"
          data-testid="auth-logout-button"
          onClick={() => void logout()}
          className={`${topBarTextButton} rounded-none rounded-r-full px-2.5 text-xs`}
        >
          {t('auth.logout')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-testid="auth-login-button"
      onClick={() => openAuth('login')}
      className={`${topBarTextButton} rounded-full border border-gray-200/80 bg-gray-50/90 px-3 dark:border-gray-600 dark:bg-gray-800/80`}
    >
      {t('auth.login')}
    </button>
  );
}
