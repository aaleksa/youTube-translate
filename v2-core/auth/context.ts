// @ts-nocheck — AWS Lambda types; enable when deploying to AWS
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { UnauthorizedError } from '../errors';
import type { AuthenticatedContext } from '../types';

export function getAuthFromApiGatewayEvent(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): AuthenticatedContext {
  const claims = event.requestContext.authorizer?.jwt?.claims;

  if (!claims?.sub) {
    throw new UnauthorizedError('Missing JWT claims');
  }

  const email =
    typeof claims.email === 'string'
      ? claims.email
      : typeof claims.username === 'string'
        ? claims.username
        : '';

  return {
    userId: String(claims.sub),
    email,
  };
}

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
