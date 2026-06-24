import { UnauthorizedError } from '../errors';

export function getBearerToken(authorizationHeader?: string | null): string {
  if (!authorizationHeader) {
    throw new UnauthorizedError('Missing Authorization header');
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedError('Invalid Authorization header');
  }

  return token;
}
