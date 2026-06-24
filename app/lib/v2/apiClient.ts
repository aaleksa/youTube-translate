import type { ApiResponse } from '../../../v2-core/types';
import { getApiBaseUrl } from './config';
import { isNetworkRequestError } from './networkError';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  saveTokens,
} from './tokenStorage';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      !payload.success && payload.error
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload.data as T;
}

function shouldClearAuthOnRefreshFailure(status: number): boolean {
  return status === 401 || status === 403;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      if (shouldClearAuthOnRefreshFailure(response.status)) {
        clearAuthStorage();
      }
      return null;
    }

    const tokens = await parseResponse<{
      accessToken: string;
      refreshToken: string;
      idToken: string;
      expiresIn: number;
    }>(response);

    saveTokens(tokens);
    return tokens.accessToken;
  } catch (error) {
    if (isNetworkRequestError(error)) {
      return null;
    }
    throw error;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<T> {
  let accessToken = getAccessToken();

  if (accessToken && isAccessTokenExpired()) {
    accessToken = await refreshAccessToken();
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (isNetworkRequestError(error)) {
      throw error;
    }
    throw error;
  }

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  return parseResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}
