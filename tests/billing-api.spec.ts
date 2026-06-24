import { expect, test } from '@playwright/test';
import { signUpAndLogin } from './helpers/auth';

interface ApiErrorEnvelope {
  success: false;
  error: string;
  code?: string;
}

test.describe('billing API', () => {
  test('checkout requires authentication', async ({ request }) => {
    const response = await request.post('/api/v2/billing/checkout');
    expect(response.status()).toBe(401);
  });

  test('checkout returns 503 when Stripe is not configured', async ({
    request,
  }) => {
    const stamp = Date.now();
    const email = `billing-${stamp}@test.local`;
    const session = await signUpAndLogin(request, email);

    const response = await request.post('/api/v2/billing/checkout', {
      headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
    });

    expect(response.status()).toBe(503);
    const body = (await response.json()) as ApiErrorEnvelope;
    expect(body.success).toBe(false);
    expect(body.code).toBe('BILLING_NOT_CONFIGURED');
  });

  test('webhook rejects missing Stripe signature', async ({ request }) => {
    const response = await request.post('/api/v2/billing/webhook', {
      data: '{}',
      headers: { 'Content-Type': 'application/json' },
    });

    expect([400, 503]).toContain(response.status());
    const body = (await response.json()) as ApiErrorEnvelope;
    expect(body.success).toBe(false);
    expect(['INVALID_WEBHOOK', 'BILLING_NOT_CONFIGURED', 'WEBHOOK_NOT_CONFIGURED']).toContain(
      body.code
    );
  });

  test('webhook rejects invalid payload without configured billing', async ({
    request,
  }) => {
    const response = await request.post('/api/v2/billing/webhook', {
      data: '{"type":"checkout.session.completed"}',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid-signature',
      },
    });

    expect([400, 503]).toContain(response.status());
    const body = (await response.json()) as ApiErrorEnvelope;
    expect(body.success).toBe(false);
  });
});
