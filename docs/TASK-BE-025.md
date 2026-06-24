# TASK-BE-025: Підписка користувача

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `userId`, `plan`, `status`, `startDate`, `endDate` | Done |
| Один запис на користувача | Done (`userId` PRIMARY KEY) |

## Схема SQLite

```sql
CREATE TABLE user_subscriptions (
  userId TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  startDate INTEGER,
  endDate INTEGER
);
```

| Поле | Тип | Опис |
|------|-----|------|
| `userId` | TEXT | Власник (з JWT), первинний ключ |
| `plan` | TEXT | Тариф: `free`, `premium`, `trial` |
| `status` | TEXT | Статус: `active`, `inactive`, `cancelled`, `expired`, `trialing` |
| `startDate` | INTEGER | Початок підписки (Unix ms), `NULL` для безкоштовного плану |
| `endDate` | INTEGER | Кінець підписки (Unix ms), `NULL` якщо без терміну або не активна |

### Значення за замовчуванням

Користувач без запису в таблиці вважається на **free** / **inactive** з `startDate` та `endDate` = `null` (логіка API — у наступних задачах Epic Premium).

## TypeScript тип

```ts
export type SubscriptionPlan = 'free' | 'premium' | 'trial';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'expired'
  | 'trialing';

export interface UserSubscriptionRecord {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: number | null;
  endDate: number | null;
}
```

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = USER_SUBSCRIPTION` (`v2-core/dynamodb/keys.ts`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `user_subscriptions` |
| `v2-core/types.ts` | `UserSubscriptionRecord`, `SubscriptionPlan`, `SubscriptionStatus` |
| `v2-core/dynamodb/keys.ts` | `userSubscriptionSk()` для майбутнього API |

API отримання/оновлення підписки — у наступних задачах Epic Premium Features.

## Перевірка

```bash
sqlite3 data/local.db ".schema user_subscriptions"

sqlite3 data/local.db "PRAGMA table_info(user_subscriptions);"
```

Очікувані колонки: `userId`, `plan`, `status`, `startDate`, `endDate`.

Після зміни схеми перезапустіть dev server (singleton `getLocalDatabase()`).
