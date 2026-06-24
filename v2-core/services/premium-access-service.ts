import { QuotaExceededError } from '../errors';
import {
  formatUsagePeriodKey,
  getFreeAiDailyLimit,
  getPremiumAiDailyLimit,
} from '../premium/config';
import {
  getEffectivePlan,
  getEffectiveStatus,
  isPremiumSubscription,
} from '../premium/is-premium';
import type { AiUsageInfo, AuthenticatedContext, PremiumAccessInfo } from '../types';
import { isLocalBackend } from '../storage/config';
import * as localAiUsage from '../storage/local-ai-usage-store';
import { aiUsageSk, userPk } from '../dynamodb/keys';
import { getItem, putItem, type DynamoItem } from '../dynamodb/repository';
import { getUserSubscription, getUserSubscriptionById } from './subscription-service';

interface AiUsageItem extends DynamoItem {
  entityType: 'AI_USAGE';
  periodKey: string;
  requestCount: number;
}

function buildAiUsageInfo(
  subscriptionIsPremium: boolean,
  used: number,
  periodKey: string
): AiUsageInfo {
  const limit = subscriptionIsPremium
    ? getPremiumAiDailyLimit()
    : getFreeAiDailyLimit();

  if (limit === null) {
    return {
      limit: null,
      used,
      remaining: null,
      periodKey,
    };
  }

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    periodKey,
  };
}

async function getAiUsageCountRemote(
  userId: string,
  periodKey: string
): Promise<number> {
  const item = await getItem<AiUsageItem>(
    userPk(userId),
    aiUsageSk(periodKey)
  );

  return item?.requestCount ?? 0;
}

async function reserveAiRequestRemote(
  userId: string,
  subscriptionIsPremium: boolean,
  periodKey: string
): Promise<number> {
  const limit = subscriptionIsPremium
    ? getPremiumAiDailyLimit()
    : getFreeAiDailyLimit();

  if (subscriptionIsPremium && limit === null) {
    return getAiUsageCountRemote(userId, periodKey);
  }

  const current = await getAiUsageCountRemote(userId, periodKey);
  if (current >= limit!) {
    throw new QuotaExceededError(`Daily AI limit reached (${limit} requests)`);
  }

  const now = Date.now();
  const nextCount = current + 1;
  await putItem({
    PK: userPk(userId),
    SK: aiUsageSk(periodKey),
    entityType: 'AI_USAGE',
    userId,
    periodKey,
    requestCount: nextCount,
    createdAt: now,
    updatedAt: now,
  });

  return nextCount;
}

export async function getPremiumAccess(
  auth: AuthenticatedContext
): Promise<PremiumAccessInfo> {
  const subscription = await getUserSubscription(auth);
  const periodKey = formatUsagePeriodKey();
  const isPremium = isPremiumSubscription(subscription);
  const used = isLocalBackend()
    ? localAiUsage.getAiUsageCount(auth.userId, periodKey)
    : await getAiUsageCountRemote(auth.userId, periodKey);

  return {
    userId: auth.userId,
    plan: getEffectivePlan(subscription),
    status: getEffectiveStatus(subscription),
    isPremium,
    subscription,
    aiUsage: buildAiUsageInfo(isPremium, used, periodKey),
  };
}

export async function reserveAiRequestForUser(userId: string): Promise<PremiumAccessInfo> {
  const subscription = await getUserSubscriptionById(userId);
  const periodKey = formatUsagePeriodKey();
  const isPremium = isPremiumSubscription(subscription);

  const used = isLocalBackend()
    ? localAiUsage.reserveAiRequest(userId, subscription, periodKey)
    : await reserveAiRequestRemote(userId, isPremium, periodKey);

  return {
    userId,
    plan: getEffectivePlan(subscription),
    status: getEffectiveStatus(subscription),
    isPremium,
    subscription,
    aiUsage: buildAiUsageInfo(isPremium, used, periodKey),
  };
}
