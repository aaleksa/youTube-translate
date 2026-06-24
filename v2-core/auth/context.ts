// @ts-nocheck — optional AWS Lambda types; excluded from tsc, lint ignored
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
