import { handleServiceError, jsonResponse, successResponse } from '../../../../../v2-core/response';
import * as billingService from '../../../../../v2-core/services/billing-service';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    await billingService.handleStripeWebhook(payload, signature);
    return jsonResponse(successResponse({ received: true }));
  } catch (error) {
    return handleServiceError(error);
  }
}
