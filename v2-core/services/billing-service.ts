import Stripe from 'stripe';
import { ApiError } from '../errors';
import {
  getAppBaseUrl,
  getStripePriceId,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
} from '../billing/config';
import type { AuthenticatedContext, UserSubscriptionRecord } from '../types';
import { isLocalBackend } from '../storage/config';
import * as localSubscriptions from '../storage/local-subscription-store';
import { userPk, userSubscriptionSk } from '../dynamodb/keys';
import { putItem, type DynamoItem } from '../dynamodb/repository';

interface UserSubscriptionItem extends DynamoItem, Omit<UserSubscriptionRecord, 'userId'> {
  entityType: 'USER_SUBSCRIPTION';
}

async function upsertSubscription(record: UserSubscriptionRecord): Promise<void> {
  if (isLocalBackend()) {
    localSubscriptions.upsertUserSubscription(record);
    return;
  }

  const now = Date.now();
  const item: UserSubscriptionItem = {
    PK: userPk(record.userId),
    SK: userSubscriptionSk(),
    entityType: 'USER_SUBSCRIPTION',
    userId: record.userId,
    plan: record.plan,
    status: record.status,
    startDate: record.startDate,
    endDate: record.endDate,
    createdAt: now,
    updatedAt: now,
  };
  await putItem(item);
}

function getStripeClient(): Stripe {
  return new Stripe(getStripeSecretKey());
}

export async function createCheckoutSession(
  auth: AuthenticatedContext
): Promise<{ url: string }> {
  if (!isStripeConfigured()) {
    throw new ApiError('Billing is not configured', 503, 'BILLING_NOT_CONFIGURED');
  }

  const stripe = getStripeClient();
  const appUrl = getAppBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    client_reference_id: auth.userId,
    customer_email: auth.email,
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    success_url: `${appUrl}/?premium=success`,
    cancel_url: `${appUrl}/?premium=cancelled`,
    metadata: { userId: auth.userId },
    subscription_data: {
      metadata: { userId: auth.userId },
    },
  });

  if (!session.url) {
    throw new ApiError('Failed to create checkout session', 500, 'CHECKOUT_FAILED');
  }

  return { url: session.url };
}

async function activatePremium(userId: string, endDate: number | null): Promise<void> {
  await upsertSubscription({
    userId,
    plan: 'premium',
    status: 'active',
    startDate: Date.now(),
    endDate,
  });
}

async function deactivatePremium(userId: string): Promise<void> {
  await upsertSubscription({
    userId,
    plan: 'free',
    status: 'cancelled',
    startDate: null,
    endDate: Date.now(),
  });
}

function resolveUserIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): string | null {
  const userId = metadata?.userId?.trim();
  return userId || null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId =
    resolveUserIdFromMetadata(session.metadata) ??
    session.client_reference_id?.trim() ??
    null;

  if (!userId) return;

  await activatePremium(userId, null);
}

function getSubscriptionPeriodEndMs(subscription: Stripe.Subscription): number | null {
  if (subscription.cancel_at) {
    return subscription.cancel_at * 1000;
  }

  const itemEnds = subscription.items?.data
    ?.map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === 'number');

  if (!itemEnds?.length) {
    return null;
  }

  return Math.max(...itemEnds) * 1000;
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = resolveUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  const endDate = getSubscriptionPeriodEndMs(subscription);

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    await activatePremium(userId, endDate);
    return;
  }

  if (
    subscription.status === 'canceled' ||
    subscription.status === 'unpaid' ||
    subscription.status === 'incomplete_expired'
  ) {
    await deactivatePremium(userId);
  }
}

export async function handleStripeWebhook(
  payload: string,
  signature: string | null
): Promise<void> {
  if (!isStripeConfigured()) {
    throw new ApiError('Billing is not configured', 503, 'BILLING_NOT_CONFIGURED');
  }

  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    throw new ApiError('Webhook secret is not configured', 503, 'WEBHOOK_NOT_CONFIGURED');
  }

  if (!signature) {
    throw new ApiError('Missing Stripe signature', 400, 'INVALID_WEBHOOK');
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }
}
