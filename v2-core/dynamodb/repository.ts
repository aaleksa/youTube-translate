import { isLocalBackend } from '../storage/config';
import * as localRepo from '../storage/local-repository';
import { ApiError } from '../errors';

export interface DynamoItem {
  PK: string;
  SK: string;
  entityType: string;
  userId: string;
  createdAt: number;
  updatedAt?: number;
  [key: string]: unknown;
}

async function getDynamoRepo() {
  try {
    return await import(
      /* webpackIgnore: true */
      './dynamo-repository'
    );
  } catch {
    throw new ApiError(
      'AWS DynamoDB mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.',
      503,
      'DYNAMODB_UNAVAILABLE'
    );
  }
}

export async function putItem(item: DynamoItem): Promise<void> {
  if (isLocalBackend()) {
    localRepo.putItem(item);
    return;
  }

  const dynamo = await getDynamoRepo();
  await dynamo.putItem(item);
}

export async function getItem<T extends DynamoItem>(
  pk: string,
  sk: string
): Promise<T | null> {
  if (isLocalBackend()) {
    return localRepo.getItem<T>(pk, sk);
  }

  const dynamo = await getDynamoRepo();
  return dynamo.getItem<T>(pk, sk);
}

export async function queryByUser<T extends DynamoItem>(
  userId: string,
  skPrefix: string
): Promise<T[]> {
  if (isLocalBackend()) {
    return localRepo.queryByUser<T>(userId, skPrefix);
  }

  const dynamo = await getDynamoRepo();
  return dynamo.queryByUser<T>(userId, skPrefix);
}

export async function deleteItem(pk: string, sk: string): Promise<void> {
  if (isLocalBackend()) {
    localRepo.deleteItem(pk, sk);
    return;
  }

  const dynamo = await getDynamoRepo();
  await dynamo.deleteItem(pk, sk);
}

export async function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, unknown>
): Promise<void> {
  if (isLocalBackend()) {
    localRepo.updateItem(pk, sk, updates);
    return;
  }

  const dynamo = await getDynamoRepo();
  await dynamo.updateItem(pk, sk, updates);
}
