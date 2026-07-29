import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function parseEventBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) return {};

  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getRawBody(event: APIGatewayProxyEventV2): string {
  if (!event.body) return '';
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
}

export function getHeader(
  event: APIGatewayProxyEventV2,
  name: string
): string | undefined {
  const headers = event.headers ?? {};
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowerName) return headers[key];
  }
  return undefined;
}

export function getEventPath(event: APIGatewayProxyEventV2): string {
  const rawPath = event.rawPath ?? event.requestContext.http.path ?? '/';
  const normalized = rawPath.replace(/^\/api\/v2/, '') || '/';
  return normalized.endsWith('/') && normalized.length > 1
    ? normalized.slice(0, -1)
    : normalized;
}

export function getQueryParams(
  event: APIGatewayProxyEventV2
): URLSearchParams {
  return new URLSearchParams(event.rawQueryString ?? '');
}

export function getRequestId(event: APIGatewayProxyEventV2): string | undefined {
  return event.requestContext.requestId;
}
