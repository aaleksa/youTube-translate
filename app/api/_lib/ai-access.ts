import { isApiError, ForbiddenError } from '../../../v2-core/errors';
import { requireAuth } from '../../../v2-core/http/request';
import { getPremiumAccess, reserveAiRequestForUser } from '../../../v2-core/services/premium-access-service';
import { NextResponse } from 'next/server';

export async function enforceAiAccess(request: Request): Promise<string> {
  const auth = await requireAuth(request);
  await reserveAiRequestForUser(auth.userId);
  return auth.userId;
}

export async function enforcePremiumCoachAccess(
  request: Request
): Promise<{ userId: string }> {
  const auth = await requireAuth(request);
  const access = await getPremiumAccess(auth);

  if (!access.isPremium) {
    throw new ForbiddenError(
      'Premium subscription required for AI Coach advice',
      'PREMIUM_REQUIRED'
    );
  }

  await reserveAiRequestForUser(auth.userId);
  return { userId: auth.userId };
}

export function aiAccessErrorResponse(error: unknown): NextResponse | null {
  if (!isApiError(error)) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
    },
    { status: error.statusCode }
  );
}
