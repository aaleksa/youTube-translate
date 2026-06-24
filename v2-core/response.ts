import type { ApiResponse } from './types';
import { isApiError } from './errors';
import { logger } from './logging/logger';

export function jsonResponse<T>(
  body: ApiResponse<T>,
  statusCode = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function successResponse<T>(data?: T): ApiResponse<T> {
  return data === undefined ? { success: true } : { success: true, data };
}

export function errorResponse(error: string, code?: string): ApiResponse {
  return { success: false, error, code };
}

export function handleServiceError(error: unknown): Response {
  if (isApiError(error)) {
    return jsonResponse(
      errorResponse(error.message, error.code),
      error.statusCode
    );
  }

  logger.error('Unhandled service error', {
    code: 'INTERNAL',
    error: error instanceof Error ? error.message : String(error),
  });
  return jsonResponse(errorResponse('Internal server error', 'INTERNAL'), 500);
}
