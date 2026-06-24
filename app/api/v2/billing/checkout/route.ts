import { requireAuth } from '../../../../../v2-core/http/request';
import * as billingService from '../../../../../v2-core/services/billing-service';
import { handleRoute } from '../../_lib/route';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return billingService.createCheckoutSession(auth);
  });
}
