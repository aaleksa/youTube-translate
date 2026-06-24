import type { AuthenticatedContext, UserSubscriptionRecord } from '../types';
import { isLocalBackend } from '../storage/config';
import * as localSubscriptions from '../storage/local-subscription-store';
import { defaultUserSubscription } from '../premium/is-premium';
import { userPk, userSubscriptionSk } from '../dynamodb/keys';
import { getItem, type DynamoItem } from '../dynamodb/repository';

interface UserSubscriptionItem extends DynamoItem {
  entityType: 'USER_SUBSCRIPTION';
  plan: UserSubscriptionRecord['plan'];
  status: UserSubscriptionRecord['status'];
  startDate: number | null;
  endDate: number | null;
}

function toRecord(item: UserSubscriptionItem): UserSubscriptionRecord {
  return {
    userId: item.userId,
    plan: item.plan,
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate,
  };
}

export async function getUserSubscription(
  auth: AuthenticatedContext
): Promise<UserSubscriptionRecord> {
  if (isLocalBackend()) {
    return localSubscriptions.getUserSubscription(auth.userId);
  }

  const item = await getItem<UserSubscriptionItem>(
    userPk(auth.userId),
    userSubscriptionSk()
  );

  if (!item || item.userId !== auth.userId) {
    return defaultUserSubscription(auth.userId);
  }

  return toRecord(item);
}

export async function getUserSubscriptionById(
  userId: string
): Promise<UserSubscriptionRecord> {
  if (isLocalBackend()) {
    return localSubscriptions.getUserSubscription(userId);
  }

  const item = await getItem<UserSubscriptionItem>(
    userPk(userId),
    userSubscriptionSk()
  );

  if (!item || item.userId !== userId) {
    return defaultUserSubscription(userId);
  }

  return toRecord(item);
}
