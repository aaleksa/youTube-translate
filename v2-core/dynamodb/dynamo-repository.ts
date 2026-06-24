// @ts-nocheck — AWS DynamoDB; enable when STORAGE_BACKEND=dynamodb
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDynamoClient, getTableName } from './client';
import { userPk } from './keys';
import type { DynamoItem } from './repository';

export async function putItem(item: DynamoItem): Promise<void> {
  const client = getDynamoClient();
  await client.send(
    new PutCommand({
      TableName: getTableName(),
      Item: item,
    })
  );
}

export async function getItem<T extends DynamoItem>(
  pk: string,
  sk: string
): Promise<T | null> {
  const client = getDynamoClient();
  const result = await client.send(
    new GetCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk },
    })
  );

  return (result.Item as T | undefined) ?? null;
}

export async function queryByUser<T extends DynamoItem>(
  userId: string,
  skPrefix: string
): Promise<T[]> {
  const client = getDynamoClient();
  const result = await client.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': userPk(userId),
        ':skPrefix': skPrefix,
      },
    })
  );

  return (result.Items as T[] | undefined) ?? [];
}

export async function deleteItem(pk: string, sk: string): Promise<void> {
  const client = getDynamoClient();
  await client.send(
    new DeleteCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk },
    })
  );
}

export async function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, unknown>
): Promise<void> {
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return;

  const expressionParts: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  for (const [index, [key, value]] of entries.entries()) {
    const nameKey = `#k${index}`;
    const valueKey = `:v${index}`;
    names[nameKey] = key;
    values[valueKey] = value;
    expressionParts.push(`${nameKey} = ${valueKey}`);
  }

  const client = getDynamoClient();
  await client.send(
    new UpdateCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}
