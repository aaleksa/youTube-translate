// @ts-nocheck — optional AWS SDK; excluded from tsc, lint ignored
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let documentClient: DynamoDBDocumentClient | null = null;

export function getTableName(): string {
  return process.env.DYNAMODB_TABLE_NAME ?? 'yoytube-main';
}

export function getDynamoClient(): DynamoDBDocumentClient {
  if (documentClient) return documentClient;

  const region = process.env.AWS_REGION ?? 'eu-west-1';
  const client = new DynamoDBClient({ region });
  documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });

  return documentClient;
}

export function isDynamoConfigured(): boolean {
  return Boolean(process.env.DYNAMODB_TABLE_NAME || process.env.AWS_REGION);
}
