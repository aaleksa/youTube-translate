import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBearerToken } from './v2-core/auth/bearer-token';
import { verifyAccessToken } from './v2-core/auth/jwt-verifier';

// --- Authentication (existing behavior, preserved) --------------------

const PUBLIC_API_PREFIXES = [
  '/api/v2/auth',
  '/api/v2/status',
  '/api/v2/billing/webhook',
];

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

async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/') || isPublicApi(pathname)) {
    return null;
  }

  if (!isAuthRequired() || !isLocalAuthMode()) {
    return null;
  }

  try {
    const token = getBearerToken(request.headers.get('authorization'));
    await verifyAccessToken(token);
    return null;
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

// --- Rate limiting ------------------------------------------------------
//
// Best-effort, in-memory rate limiting for API routes. This protects a
// single-process deployment (Docker/self-hosted, `npm start`) from cost
// abuse (OpenAI calls, yt-dlp/network scraping) and basic auth brute-force.
//
// Caveat for serverless hosts (Vercel): each concurrent function instance
// keeps its own counters, so the *effective* limit is `limit * instanceCount`
// rather than a hard global cap. For a strict cross-instance limit, swap the
// in-memory `buckets` Map below for a shared store such as Upstash Redis
// (`@upstash/ratelimit`).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

// Routes that call OpenAI or do heavy network/subprocess work - kept tight
// since each request has a real dollar cost.
const AI_AND_EXTRACTION_ROUTES = new Set([
  '/api/transcript',
  '/api/transcript/languages',
  '/api/playlist',
  '/api/coach-advice',
  '/api/enrich-flashcard',
  '/api/explain-sentence',
  '/api/find-collocations',
  '/api/find-frequent-words',
  '/api/find-idioms',
  '/api/find-key-vocabulary',
  '/api/find-phrasal-verbs',
  '/api/find-slang',
  '/api/find-useful-phrases',
  '/api/generate-chapters',
  '/api/generate-notes',
  '/api/generate-quiz',
  '/api/generate-timeline',
  '/api/grammar-highlights',
  '/api/process-text',
  '/api/translate-lines',
  '/api/video-difficulty',
  '/api/video-summary',
]);

interface RateLimitRule {
  id: string;
  matches: (pathname: string) => boolean;
  limit: number;
  windowMs: number;
}

const RULES: RateLimitRule[] = [
  // Auth: brute-force protection on login/signup/password-reset.
  {
    id: 'auth',
    matches: (p) => p.startsWith('/api/v2/auth/'),
    limit: 10,
    windowMs: 60_000,
  },
  // AI + transcript extraction: the most expensive routes.
  {
    id: 'ai',
    matches: (p) => AI_AND_EXTRACTION_ROUTES.has(p),
    limit: 20,
    windowMs: 60_000,
  },
  // Everything else under /api/* (data CRUD, status checks, etc).
  {
    id: 'default',
    matches: (p) => p.startsWith('/api/'),
    limit: 100,
    windowMs: 60_000,
  },
];

function checkRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const rule = RULES.find((r) => r.matches(pathname));
  if (!rule) return null;

  const now = Date.now();
  cleanupStaleBuckets(now);

  const ip = getClientIp(request);
  const key = `${rule.id}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }

  if (bucket.count >= rule.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  bucket.count += 1;
  return null;
}

// --- Entry point ----------------------------------------------------------

export async function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const rateLimited = checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const unauthorized = await checkAuth(request);
  if (unauthorized) return unauthorized;

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
