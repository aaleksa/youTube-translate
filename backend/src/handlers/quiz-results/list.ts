import * as quizResultService from '../../../../v2-core/services/quiz-result-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const videoId = event.queryStringParameters?.videoId;
  const results = await quizResultService.listQuizResults(auth, videoId);
  return ok(results);
});
