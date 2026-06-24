# TASK-BE-003: Таблиця Users

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `email`, `name`, `createdAt`, `updatedAt` | Done |
| `id` унікальний | Done (`PRIMARY KEY`) |
| `email` індексується | Done (`UNIQUE` + `idx_users_email`) |

## Схема SQLite

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- унікальний userId (UUID)
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  createdAt INTEGER NOT NULL,       -- Unix ms
  updatedAt INTEGER NOT NULL,       -- Unix ms
  -- auth (BE-001 / BE-002)
  passwordHash TEXT NOT NULL DEFAULT '',
  emailVerified INTEGER NOT NULL DEFAULT 1,
  resetCode TEXT,
  resetCodeExpiresAt INTEGER,
  googleId TEXT,
  authProvider TEXT NOT NULL DEFAULT 'local'
);

CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_google_id ON users(googleId) WHERE googleId IS NOT NULL;
```

## TypeScript тип

```ts
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
```

`GET /api/v2/me` повертає `AuthUser` з тими ж полями (`userId` = `id`) плюс `emailVerified`.

## Поведінка

| Подія | `name` | `updatedAt` |
|-------|--------|-------------|
| Sign up (email) | `''` | = `createdAt` |
| Sign up (Google) | з Google profile | = `createdAt` |
| Link Google до існуючого email | заповнюється, якщо було порожньо | оновлюється |
| Reset password | без змін | оновлюється |

## Міграція існуючих БД

При старті `getLocalDatabase()`:

1. `ALTER TABLE` додає `name` (default `''`) та `updatedAt`
2. Для старих рядків: `updatedAt = createdAt`
3. Створюється індекс `idx_users_email`, якщо його ще немає

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема + міграція |
| `v2-core/types.ts` | `UserRecord`, `AuthUser` |
| `v2-core/storage/local-auth-store.ts` | INSERT/UPDATE users |

## Перевірка

```bash
sqlite3 data/local.db "PRAGMA table_info(users);"
sqlite3 data/local.db "PRAGMA index_list(users);"
sqlite3 data/local.db "SELECT id, email, name, createdAt, updatedAt FROM users;"
```
