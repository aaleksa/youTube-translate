# TASK-BE-016: Таблиця Vocabulary Progress

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `word`, `reviewCount`, `mastered`, `lastReviewDate` | Done |
| Прогрес прив'язаний до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE vocabulary_progress (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  word TEXT NOT NULL,
  reviewCount INTEGER NOT NULL DEFAULT 0,
  mastered INTEGER NOT NULL DEFAULT 0,
  lastReviewDate INTEGER
);

CREATE INDEX idx_vocabulary_progress_user ON vocabulary_progress(userId);
CREATE UNIQUE INDEX idx_vocabulary_progress_user_word ON vocabulary_progress(userId, word);
```

| Поле | Тип | Опис |
|------|-----|------|
| `id` | TEXT | UUID запису |
| `userId` | TEXT | Власник (з JWT) |
| `word` | TEXT | Слово (нормалізоване, lowercase) |
| `reviewCount` | INTEGER | Кількість повторень |
| `mastered` | INTEGER | `0` / `1` — слово освоєне |
| `lastReviewDate` | INTEGER | Unix ms останнього повторення (`NULL` якщо ще не було) |

Унікальність: одне слово на користувача (`userId` + `word`).

## TypeScript тип

```ts
export interface VocabularyProgressRecord {
  id: string;
  userId: string;
  word: string;
  reviewCount: number;
  mastered: boolean;
  lastReviewDate: number | null;
}
```

## Відповідність UI (flashcards / SRS)

| Backend | Frontend |
|---------|----------|
| `word` | `Flashcard.word` |
| `reviewCount` | `Flashcard.repetitions` (або лічильник review) |
| `mastered` | `getCardState(card) === 'mastered'` |
| `lastReviewDate` | `Flashcard.lastReviewedAt` |

Агрегований прогрес у UI (`getVocabularyProgress`) лишається обчисленим з карток; ця таблиця — **per-word** збереження для синхронізації між пристроями.

API — у наступних задачах Epic Vocabulary Progress.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = VOCAB_PROGRESS#<id>` (`v2-core/dynamodb/keys.ts`).

> `ENTITY.PROGRESS` — окремий агрегований прогрес користувача (`/api/v2/progress`), не плутати з `VOCAB_PROGRESS`.

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `vocabulary_progress` |
| `v2-core/types.ts` | `VocabularyProgressRecord`, `UpsertVocabularyProgressInput` |
| `v2-core/dynamodb/keys.ts` | `vocabularyProgressSk()` для майбутнього API |

## Перевірка

```bash
# Після npm run dev (схема створюється при першому зверненні до БД)
sqlite3 data/local.db ".schema vocabulary_progress"

sqlite3 data/local.db "PRAGMA table_info(vocabulary_progress);"
```

Очікувані колонки: `id`, `userId`, `word`, `reviewCount`, `mastered`, `lastReviewDate`.
