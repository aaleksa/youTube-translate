import { requireAuth } from '../../../../v2-core/http/request';
import * as premiumAccessService from '../../../../v2-core/services/premium-access-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return premiumAccessService.getPremiumAccess(auth);
  });
}
