import type { AuthTokens, AuthUser } from '../../../v2-core/types';

const ACCESS_TOKEN_KEY = 'yoytube-v2-access-token';
const REFRESH_TOKEN_KEY = 'yoytube-v2-refresh-token';
const ID_TOKEN_KEY = 'yoytube-v2-id-token';
const EXPIRES_AT_KEY = 'yoytube-v2-expires-at';
const USER_KEY = 'yoytube-v2-user';

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

export function saveTokens(tokens: AuthTokens): void {
  if (!canUseStorage()) return;

  const expiresAt = Date.now() + tokens.expiresIn * 1000;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(ID_TOKEN_KEY, tokens.idToken);
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getExpiresAt(): number | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(EXPIRES_AT_KEY);
  return raw ? Number(raw) : null;
}

export function isAccessTokenExpired(bufferMs = 60_000): boolean {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - bufferMs;
}

export function saveUser(user: AuthUser): void {
  if (!canUseStorage()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  if (!canUseStorage()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(USER_KEY);
}
