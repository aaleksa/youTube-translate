# TASK-BE-006: Таблиця Flashcards

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `word`, `translation`, `example`, `videoId`, `createdAt` | Done |
| Картки прив'язані до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE flashcards (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT NOT NULL DEFAULT '',
  videoId TEXT,
  createdAt INTEGER NOT NULL,
  meta TEXT NOT NULL DEFAULT '{}'   -- SRS, tags, decks (розширення)
);

CREATE INDEX idx_flashcards_user ON flashcards(userId);
CREATE INDEX idx_flashcards_user_video ON flashcards(userId, videoId);
```

## TypeScript тип

```ts
export interface Flashcard {
  id: string;
  userId: string;
  word: string;
  translation: string;
  example: string;
  videoId: string | null;
  createdAt: number;
}
```

`FlashcardRecord` (API) розширює `Flashcard` полями SRS (`repetitions`, `ease`, …) — зберігаються в колонці `meta`.

## API

Існуючі маршрути без змін:

| Метод | Endpoint |
|-------|----------|
| GET | `/api/v2/flashcards` |
| POST | `/api/v2/flashcards` |
| PUT | `/api/v2/flashcards/:id` |
| DELETE | `/api/v2/flashcards/:id` |

У local mode дані пишуться в таблицю `flashcards`. У DynamoDB mode — як раніше в `items` (`CARD#`).

## Міграція

При старті картки з legacy-таблиці `items` (`SK LIKE 'CARD#%'`) копіюються в `flashcards` (`INSERT OR IGNORE`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема + міграція |
| `v2-core/types.ts` | `Flashcard`, `FlashcardRecord` |
| `v2-core/storage/local-flashcard-store.ts` | Local CRUD |
| `v2-core/services/flashcard-service.ts` | Facade local / DynamoDB |

## Перевірка

```bash
TOKEN="..."

curl -s -X POST http://localhost:3000/api/v2/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","translation":"привіт","example":"Hello world","videoId":"abc123"}'

sqlite3 data/local.db "SELECT id, userId, word, translation, example, videoId, createdAt FROM flashcards;"
```

**Примітка:** UI синхронізує картки з API при вході (`bootstrapFlashcardsSync`) і після create/update/delete. Розширені поля (enrichment, quiz stats, videoUrl) лишаються в `localStorage`.
