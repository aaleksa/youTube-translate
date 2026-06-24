// @ts-nocheck — optional AWS Cognito JWT; excluded from tsc, lint ignored
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthorizedError } from '../errors';
import type { AuthenticatedContext } from '../types';
import { getCognitoConfig } from './config';

let accessTokenVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getAccessTokenVerifier() {
  if (accessTokenVerifier) return accessTokenVerifier;

  const config = getCognitoConfig();
  accessTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: 'access',
    clientId: config.clientId,
  });

  return accessTokenVerifier;
}

export async function verifyCognitoAccessToken(
  token: string
): Promise<AuthenticatedContext> {
  try {
    const payload = await getAccessTokenVerifier().verify(token);
    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload.username === 'string'
          ? payload.username
          : '';

    return {
      userId: String(payload.sub),
      email,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
