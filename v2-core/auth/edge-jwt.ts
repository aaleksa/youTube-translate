import { jwtVerify } from 'jose';
import { getLocalAuthSecret } from '../storage/config';

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getLocalAuthSecret());
}

export async function verifyAccessTokenEdge(
  token: string
): Promise<{ userId: string; email: string }> {
  const { payload } = await jwtVerify(token, getSecretKey());

  if (payload.token_use !== 'access') {
    throw new Error('Invalid token type');
  }

  if (!payload.sub) {
    throw new Error('Missing subject');
  }

  return {
    userId: String(payload.sub),
    email: typeof payload.email === 'string' ? payload.email : '',
  };
}
