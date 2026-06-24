import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  saveTokens,
} from './v2/tokenStorage';
import { getApiBaseUrl } from './v2/config';

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthStorage();
    return null;
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: {
      accessToken: string;
      refreshToken: string;
      idToken: string;
      expiresIn: number;
    };
  };

  if (!payload.success || !payload.data) {
    clearAuthStorage();
    return null;
  }

  saveTokens(payload.data);
  return payload.data.accessToken;
}

export async function fetchAiApi(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<Response> {
  let accessToken = getAccessToken();

  if (accessToken && isAccessTokenExpired()) {
    accessToken = await refreshAccessToken();
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(path, { ...options, headers });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchAiApi(path, options, false);
    }
  }

  return response;
}
