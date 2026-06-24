'use client';

import { isEmailVerificationEnabledOnClient } from '../../lib/v2/config';
import { useAuth } from './AuthProvider';
import { useI18n } from '../InterfaceLanguageProvider';

export default function AuthPanel() {
  const { t } = useI18n();
  const {
    authView,
    closeAuth,
    pendingEmail,
    signUp,
    confirmSignUp,
    login,
    forgotPassword,
    confirmForgotPassword,
    openAuth,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!authView) return null;

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : t('auth.errorGeneric');
    setLocalError(message);
  };

  const submit = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setLocalError(null);
    try {
      await action();
      setPassword('');
      setCode('');
      setNewPassword('');
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    authView === 'signup'
      ? t('auth.signUpTitle')
      : authView === 'confirm'
        ? t('auth.confirmTitle')
        : authView === 'forgot'
          ? t('auth.forgotTitle')
          : authView === 'reset'
            ? t('auth.resetTitle')
            : t('auth.loginTitle');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-6"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {authView === 'confirm' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('auth.confirmHint', { email: pendingEmail })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {localError && (
          <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {localError}
          </p>
        )}

        <div className="space-y-3">
          {(authView === 'login' ||
            authView === 'signup' ||
            authView === 'forgot') && (
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.email')}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                autoComplete="email"
              />
            </label>
          )}

          {(authView === 'login' || authView === 'signup') && (
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.password')}
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                autoComplete={
                  authView === 'signup' ? 'new-password' : 'current-password'
                }
              />
            </label>
          )}

          {(authView === 'confirm' || authView === 'reset') && (
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.code')}
              </span>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                autoComplete="one-time-code"
              />
            </label>
          )}

          {authView === 'reset' && (
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.newPassword')}
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                autoComplete="new-password"
              />
            </label>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {authView === 'login' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(() => login(email, password))}
              className="w-full min-h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {t('auth.login')}
            </button>
          )}

          {authView === 'signup' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(() => signUp(email, password))}
              className="w-full min-h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {t('auth.signUp')}
            </button>
          )}

          {authView === 'confirm' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(() => confirmSignUp(code))}
              className="w-full min-h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {t('auth.confirm')}
            </button>
          )}

          {authView === 'forgot' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(() => forgotPassword(email))}
              className="w-full min-h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {t('auth.sendResetCode')}
            </button>
          )}

          {authView === 'reset' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(() => confirmForgotPassword(code, newPassword))}
              className="w-full min-h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {t('auth.resetPassword')}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {authView !== 'login' && (
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('auth.backToLogin')}
            </button>
          )}
          {authView === 'login' && (
            <>
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('auth.createAccount')}
              </button>
              {isEmailVerificationEnabledOnClient() && (
                <button
                  type="button"
                  onClick={() => openAuth('forgot')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
