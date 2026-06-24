import type {
  SubscriptionPlan,
  SubscriptionStatus,
  UserSubscriptionRecord,
} from '../types';

export function defaultUserSubscription(userId: string): UserSubscriptionRecord {
  return {
    userId,
    plan: 'free',
    status: 'inactive',
    startDate: null,
    endDate: null,
  };
}

export function isPremiumSubscription(
  subscription: UserSubscriptionRecord,
  now = Date.now()
): boolean {
  if (subscription.endDate !== null && subscription.endDate < now) {
    return false;
  }

  if (subscription.plan === 'premium' && subscription.status === 'active') {
    return true;
  }

  if (subscription.plan === 'trial' && subscription.status === 'trialing') {
    return true;
  }

  return false;
}

export function isFreePlan(subscription: UserSubscriptionRecord): boolean {
  return !isPremiumSubscription(subscription);
}

export function getEffectivePlan(
  subscription: UserSubscriptionRecord,
  now = Date.now()
): SubscriptionPlan {
  return isPremiumSubscription(subscription, now) ? subscription.plan : 'free';
}

export function getEffectiveStatus(
  subscription: UserSubscriptionRecord,
  now = Date.now()
): SubscriptionStatus {
  if (subscription.endDate !== null && subscription.endDate < now) {
    return 'expired';
  }

  return subscription.status;
}
