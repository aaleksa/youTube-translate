import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBearerToken } from './v2-core/auth/context';
import { verifyAccessTokenEdge } from './v2-core/auth/edge-jwt';

const PUBLIC_API_PREFIXES = ['/api/v2/auth', '/api/v2/status'];

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRequired(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_V2_ENABLED !== 'false';
}

function isLocalAuthMode(): boolean {
  const configured = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  return configured !== 'dynamodb';
}

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/') || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthRequired() || !isLocalAuthMode()) {
    return NextResponse.next();
  }

  try {
    const token = getBearerToken(request.headers.get('authorization'));
    await verifyAccessTokenEdge(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
