# TASK-BE-010: Створення таблиці Bookmarks

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `videoId`, `timestamp`, `note`, `createdAt` | Done |
| Закладки прив'язані до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  videoId TEXT NOT NULL,
  timestamp REAL NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  createdAt INTEGER NOT NULL
);

CREATE INDEX idx_bookmarks_user ON bookmarks(userId);
CREATE INDEX idx_bookmarks_user_video ON bookmarks(userId, videoId);
```

| Поле | Тип | Опис |
|------|-----|------|
| `id` | TEXT | UUID закладки |
| `userId` | TEXT | Власник (з JWT) |
| `videoId` | TEXT | YouTube video ID |
| `timestamp` | REAL | Позиція у відео (секунди, дробові значення дозволені) |
| `note` | TEXT | Текст закладки (у UI — підпис біля таймкоду) |
| `createdAt` | INTEGER | Unix ms |

## TypeScript тип

```ts
export interface BookmarkRecord {
  id: string;
  userId: string;
  videoId: string;
  timestamp: number;
  note: string;
  createdAt: number;
}
```

## Відповідність UI (localStorage)

| Backend | Frontend (`app/lib/bookmarks.ts`) |
|---------|-----------------------------------|
| `timestamp` | `seconds` |
| `note` | `label` |

Синхронізація з API — у наступних задачах Epic Bookmarks.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = BOOKMARK#<id>` (`v2-core/dynamodb/keys.ts`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `bookmarks` |
| `v2-core/types.ts` | `BookmarkRecord`, `CreateBookmarkInput` |
| `v2-core/dynamodb/keys.ts` | `bookmarkSk()` для майбутнього API |

## Перевірка

```bash
# Після npm run dev (схема створюється при першому зверненні до БД)
sqlite3 data/local.db ".schema bookmarks"

sqlite3 data/local.db "PRAGMA table_info(bookmarks);"
```

Очікувані колонки: `id`, `userId`, `videoId`, `timestamp`, `note`, `createdAt`.
