import { ApiError } from '../errors';
import type { AuthenticatedContext } from '../types';
import { isLocalBackend } from '../storage/config';
import { verifyLocalAccessToken } from './local-jwt';

export async function verifyAccessToken(
  token: string
): Promise<AuthenticatedContext> {
  if (isLocalBackend()) {
    return verifyLocalAccessToken(token);
  }

  try {
    const { verifyCognitoAccessToken } = await import(
      /* webpackIgnore: true */
      './cognito-jwt-verifier'
    );
    return verifyCognitoAccessToken(token);
  } catch {
    throw new ApiError(
      'AWS Cognito mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.',
      503,
      'COGNITO_UNAVAILABLE'
    );
  }
}
