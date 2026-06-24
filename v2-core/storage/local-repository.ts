import type { DynamoItem } from '../dynamodb/repository';
import { getLocalDatabase } from './local-db';

function serializeItem(item: DynamoItem): string {
  const { PK, SK, entityType, userId, createdAt, updatedAt, ...rest } = item;
  return JSON.stringify(rest);
}

function deserializeItem(row: {
  PK: string;
  SK: string;
  entityType: string;
  userId: string;
  data: string;
  createdAt: number;
  updatedAt: number | null;
}): DynamoItem {
  const extra = JSON.parse(row.data) as Record<string, unknown>;
  return {
    PK: row.PK,
    SK: row.SK,
    entityType: row.entityType,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    ...extra,
  };
}

export function putItem(item: DynamoItem): void {
  const db = getLocalDatabase();
  const { PK, SK, entityType, userId, createdAt, updatedAt } = item;

  db.prepare(
    `INSERT INTO items (PK, SK, entityType, userId, data, createdAt, updatedAt)
     VALUES (@PK, @SK, @entityType, @userId, @data, @createdAt, @updatedAt)
     ON CONFLICT(PK, SK) DO UPDATE SET
       entityType = excluded.entityType,
       userId = excluded.userId,
       data = excluded.data,
       createdAt = excluded.createdAt,
       updatedAt = excluded.updatedAt`
  ).run({
    PK,
    SK,
    entityType,
    userId,
    data: serializeItem(item),
    createdAt,
    updatedAt: updatedAt ?? null,
  });
}

export function getItem<T extends DynamoItem>(pk: string, sk: string): T | null {
  const db = getLocalDatabase();
  const row = db
    .prepare(
      `SELECT PK, SK, entityType, userId, data, createdAt, updatedAt
       FROM items WHERE PK = ? AND SK = ?`
    )
    .get(pk, sk) as
    | {
        PK: string;
        SK: string;
        entityType: string;
        userId: string;
        data: string;
        createdAt: number;
        updatedAt: number | null;
      }
    | undefined;

  return row ? (deserializeItem(row) as T) : null;
}

export function queryByUser<T extends DynamoItem>(
  userId: string,
  skPrefix: string
): T[] {
  const db = getLocalDatabase();
  const rows = db
    .prepare(
      `SELECT PK, SK, entityType, userId, data, createdAt, updatedAt
       FROM items
       WHERE userId = ? AND SK LIKE ?
       ORDER BY createdAt ASC`
    )
    .all(userId, `${skPrefix}%`) as Array<{
    PK: string;
    SK: string;
    entityType: string;
    userId: string;
    data: string;
    createdAt: number;
    updatedAt: number | null;
  }>;

  return rows.map((row) => deserializeItem(row) as T);
}

export function deleteItem(pk: string, sk: string): void {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM items WHERE PK = ? AND SK = ?`).run(pk, sk);
}

export function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, unknown>
): void {
  const existing = getItem(pk, sk);
  if (!existing) return;

  const merged = { ...existing, ...updates, PK: pk, SK: sk };
  putItem(merged as DynamoItem);
}
