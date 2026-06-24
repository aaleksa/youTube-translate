import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { getAuthFromApiGatewayEvent } from '../auth/context';
import { handleServiceError, jsonResponse, successResponse } from '../response';
import type { AuthenticatedContext } from '../types';

type PublicHandler = (
  event: APIGatewayProxyEventV2
) => Promise<APIGatewayProxyResultV2>;

type ProtectedHandler = (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  auth: AuthenticatedContext
) => Promise<APIGatewayProxyResultV2>;

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

function toApiGatewayResponse(response: Response): APIGatewayProxyResultV2 {
  return {
    statusCode: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
    body: response.body ? undefined : '',
  };
}

async function readBody(event: APIGatewayProxyEventV2): Promise<unknown> {
  if (!event.body) return {};
  try {
    return JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body
    );
  } catch {
    return {};
  }
}

export function createPublicHandler(handler: PublicHandler) {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    if (event.requestContext.http.method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: corsHeaders(),
      };
    }

    try {
      return await handler(event);
    } catch (error) {
      const response = handleServiceError(error);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
        body: await response.text(),
      };
    }
  };
}

export function createProtectedHandler(handler: ProtectedHandler) {
  return async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
  ): Promise<APIGatewayProxyResultV2> => {
    if (event.requestContext.http.method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: corsHeaders(),
      };
    }

    try {
      const auth = getAuthFromApiGatewayEvent(event);
      return await handler(event, auth);
    } catch (error) {
      const response = handleServiceError(error);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
        body: await response.text(),
      };
    }
  };
}

export async function ok<T>(data?: T, statusCode = 200) {
  const response = jsonResponse(successResponse(data), statusCode, corsHeaders());
  return {
    statusCode: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
    body: await response.text(),
  };
}

export { readBody };
