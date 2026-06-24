import { QuotaExceededError } from '../errors';
import {
  formatUsagePeriodKey,
  getFreeAiDailyLimit,
  getPremiumAiDailyLimit,
} from '../premium/config';
import { isPremiumSubscription } from '../premium/is-premium';
import type { UserSubscriptionRecord } from '../types';
import { getLocalDatabase } from './local-db';

interface AiUsageRow {
  userId: string;
  periodKey: string;
  requestCount: number;
}

export function getAiUsageCount(
  userId: string,
  periodKey = formatUsagePeriodKey()
): number {
  const db = getLocalDatabase();
  const row = db
    .prepare(
      `SELECT requestCount FROM ai_usage WHERE userId = ? AND periodKey = ?`
    )
    .get(userId, periodKey) as Pick<AiUsageRow, 'requestCount'> | undefined;

  return row?.requestCount ?? 0;
}

export function reserveAiRequest(
  userId: string,
  subscription: UserSubscriptionRecord,
  periodKey = formatUsagePeriodKey()
): number {
  if (isPremiumSubscription(subscription)) {
    const premiumLimit = getPremiumAiDailyLimit();
    if (premiumLimit === null) {
      return getAiUsageCount(userId, periodKey);
    }
  }

  const limit = isPremiumSubscription(subscription)
    ? getPremiumAiDailyLimit()!
    : getFreeAiDailyLimit();

  const db = getLocalDatabase();

  const reserve = db.transaction(() => {
    const current = getAiUsageCount(userId, periodKey);
    if (current >= limit) {
      throw new QuotaExceededError(
        `Daily AI limit reached (${limit} requests)`
      );
    }

    db.prepare(
      `INSERT INTO ai_usage (userId, periodKey, requestCount)
       VALUES (?, ?, 1)
       ON CONFLICT(userId, periodKey) DO UPDATE SET
         requestCount = requestCount + 1`
    ).run(userId, periodKey);

    return current + 1;
  });

  return reserve();
}
