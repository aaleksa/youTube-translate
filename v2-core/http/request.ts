import { UnauthorizedError } from '../errors';
import type { AuthenticatedContext } from '../types';
import { getBearerToken } from '../auth/context';
import { verifyAccessToken } from '../auth/jwt-verifier';

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new UnauthorizedError('Invalid JSON body');
  }
}

export async function requireAuth(request: Request): Promise<AuthenticatedContext> {
  const token = getBearerToken(request.headers.get('authorization'));
  return verifyAccessToken(token);
}
