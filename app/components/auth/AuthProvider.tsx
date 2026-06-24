'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthUser } from '../../../v2-core/types';
import * as authApi from '../../lib/v2/authApi';
import { bootstrapUserData } from '../../lib/v2/authBootstrap';
import {
  clearUserSession,
} from '../../lib/v2/userSession';
import { isBackendV2Enabled, isEmailVerificationEnabledOnClient } from '../../lib/v2/config';
import {
  clearAuthStorage,
  getAccessToken,
} from '../../lib/v2/tokenStorage';

type AuthView = 'login' | 'signup' | 'confirm' | 'forgot' | 'reset';

interface AuthContextValue {
  enabled: boolean;
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  authView: AuthView | null;
  pendingEmail: string;
  error: string | null;
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (
    code: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const enabled = isBackendV2Enabled();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authView, setAuthView] = useState<AuthView | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return;
    }

    const bootstrap = async () => {
      const token = getAccessToken();

      if (!token) {
        clearAuthStorage();
        setUser(null);
        setReady(true);
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        await bootstrapUserData(currentUser.userId);
      } catch {
        clearAuthStorage();
        await clearUserSession();
        setUser(null);
      } finally {
        setReady(true);
      }
    };

    void bootstrap();
  }, [enabled]);

  const openAuth = useCallback((view: AuthView = 'login') => {
    setError(null);
    setAuthView(view);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthView(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    await authApi.signUp({ email, password });

    if (!isEmailVerificationEnabledOnClient()) {
      const currentUser = await authApi.login({ email, password });
      setUser(currentUser);
      setAuthView(null);
      const switched = await bootstrapUserData(currentUser.userId);
      if (switched) window.location.reload();
      return;
    }

    setPendingEmail(email);
    setAuthView('confirm');
  }, []);

  const confirmSignUp = useCallback(
    async (code: string) => {
      setError(null);
      await authApi.confirmSignUp({ email: pendingEmail, code });
      setAuthView('login');
    },
    [pendingEmail]
  );

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const currentUser = await authApi.login({ email, password });
    setUser(currentUser);
    setAuthView(null);
    const switched = await bootstrapUserData(currentUser.userId);
    if (switched) window.location.reload();
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setError(null);
    const currentUser = await authApi.loginWithGoogle(idToken);
    setUser(currentUser);
    setAuthView(null);
    const switched = await bootstrapUserData(currentUser.userId);
    if (switched) window.location.reload();
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    await authApi.logout();
    await clearUserSession();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    await authApi.forgotPassword({ email });
    setPendingEmail(email);
    setAuthView('reset');
  }, []);

  const confirmForgotPassword = useCallback(
    async (code: string, newPassword: string) => {
      setError(null);
      await authApi.confirmForgotPassword({
        email: pendingEmail,
        code,
        newPassword,
      });
      setAuthView('login');
    },
    [pendingEmail]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled,
      ready,
      user,
      isAuthenticated: Boolean(user),
      authView,
      pendingEmail,
      error,
      openAuth,
      closeAuth,
      signUp,
      confirmSignUp,
      login,
      loginWithGoogle,
      logout,
      forgotPassword,
      confirmForgotPassword,
      clearError,
    }),
    [
      enabled,
      ready,
      user,
      authView,
      pendingEmail,
      error,
      openAuth,
      closeAuth,
      signUp,
      confirmSignUp,
      login,
      loginWithGoogle,
      logout,
      forgotPassword,
      confirmForgotPassword,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
