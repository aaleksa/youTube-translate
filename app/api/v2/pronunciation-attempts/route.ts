import type { CreatePronunciationAttemptInput } from '../../../../v2-core/types';
import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import * as pronunciationAttemptService from '../../../../v2-core/services/pronunciation-attempt-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return pronunciationAttemptService.listPronunciationAttempts(auth);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<CreatePronunciationAttemptInput>(request);
    return pronunciationAttemptService.createPronunciationAttempt(auth, body);
  }, 201);
}
