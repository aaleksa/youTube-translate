import * as reviewService from '../../../../v2-core/services/review-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const reviews = await reviewService.listTodayReviews(auth);
  return ok(reviews);
});
