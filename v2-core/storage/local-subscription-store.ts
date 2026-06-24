import type { UserSubscriptionRecord } from '../types';
import { defaultUserSubscription } from '../premium/is-premium';
import { getLocalDatabase } from './local-db';

interface UserSubscriptionRow {
  userId: string;
  plan: UserSubscriptionRecord['plan'];
  status: UserSubscriptionRecord['status'];
  startDate: number | null;
  endDate: number | null;
}

function toRecord(row: UserSubscriptionRow): UserSubscriptionRecord {
  return {
    userId: row.userId,
    plan: row.plan,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
  };
}

export function getUserSubscription(userId: string): UserSubscriptionRecord {
  const db = getLocalDatabase();
  const row = db
    .prepare(`SELECT * FROM user_subscriptions WHERE userId = ?`)
    .get(userId) as UserSubscriptionRow | undefined;

  if (!row) {
    return defaultUserSubscription(userId);
  }

  return toRecord(row);
}
