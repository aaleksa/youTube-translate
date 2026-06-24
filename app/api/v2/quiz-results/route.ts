import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import type { CreateQuizResultInput } from '../../../../v2-core/types';
import * as quizResultService from '../../../../v2-core/services/quiz-result-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId') ?? undefined;
    return quizResultService.listQuizResults(auth, videoId);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<CreateQuizResultInput>(request);
    return quizResultService.createQuizResult(auth, body);
  }, 201);
}
