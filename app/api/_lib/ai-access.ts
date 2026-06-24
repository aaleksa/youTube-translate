import { isApiError } from '../../../v2-core/errors';
import { requireAuth } from '../../../v2-core/http/request';
import { reserveAiRequestForUser } from '../../../v2-core/services/premium-access-service';
import { NextResponse } from 'next/server';

export async function enforceAiAccess(request: Request): Promise<string> {
  const auth = await requireAuth(request);
  await reserveAiRequestForUser(auth.userId);
  return auth.userId;
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
