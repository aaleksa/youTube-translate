import { requireAuth } from '../../../../../v2-core/http/request';
import * as reviewService from '../../../../../v2-core/services/review-service';
import { handleRoute } from '../../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return reviewService.listTodayReviews(auth);
  });
}
