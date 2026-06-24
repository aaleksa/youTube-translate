import { ApiError } from '../errors';
import type { AuthenticatedContext } from '../types';
import { getBearerToken } from '../auth/bearer-token';
import { verifyAccessToken } from '../auth/jwt-verifier';

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError('Invalid JSON body', 400, 'INVALID_JSON');
  }
}

export async function requireAuth(request: Request): Promise<AuthenticatedContext> {
  const token = getBearerToken(request.headers.get('authorization'));
  return verifyAccessToken(token);
}
