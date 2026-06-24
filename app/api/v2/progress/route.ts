import { requireAuth } from '../../../../v2-core/http/request';
import * as progressService from '../../../../v2-core/services/progress-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return progressService.getProgress(auth);
  });
}
