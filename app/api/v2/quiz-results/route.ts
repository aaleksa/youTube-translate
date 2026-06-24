import { requireAuth } from '../../../../v2-core/http/request';
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
