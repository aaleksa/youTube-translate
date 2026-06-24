import { randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { UnauthorizedError } from '../errors';
import type { AuthenticatedContext, AuthTokens } from '../types';
import { getLocalAuthSecret } from '../storage/config';

const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getLocalAuthSecret());
}

export async function issueLocalTokens(user: {
  userId: string;
  email: string;
}): Promise<AuthTokens> {
  const secret = getSecretKey();
  const refreshToken = randomUUID();
  const expiresIn = 3600;

  const accessToken = await new SignJWT({
    email: user.email,
    token_use: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret);

  const idToken = await new SignJWT({
    email: user.email,
    token_use: 'id',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret);

  const { saveRefreshToken } = await import('../storage/local-auth-store');
  saveRefreshToken(refreshToken, user.userId, Date.now() + REFRESH_TOKEN_TTL_MS);

  return {
    accessToken,
    refreshToken,
    idToken,
    expiresIn,
  };
}

export async function verifyLocalAccessToken(
  token: string
): Promise<AuthenticatedContext> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.token_use !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    return {
      userId: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : '',
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export { REFRESH_TOKEN_TTL_MS };
