# TASK-BE-018: Збереження Explain Sentence

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `sentence`, `explanation`, `translation`, `createdAt` | Done |
| Результати прив'язані до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE sentence_explanations (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  sentence TEXT NOT NULL,
  explanation TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT '',
  createdAt INTEGER NOT NULL
);

CREATE INDEX idx_sentence_explanations_user ON sentence_explanations(userId);
CREATE INDEX idx_sentence_explanations_user_created ON sentence_explanations(userId, createdAt);
```

| Поле | Тип | Опис |
|------|-----|------|
| `id` | TEXT | UUID запису |
| `userId` | TEXT | Власник (з JWT) |
| `sentence` | TEXT | Оригінальне англійське речення |
| `explanation` | TEXT | Пояснення значення (AI `meaning`) |
| `translation` | TEXT | Переклад речення мовою користувача |
| `createdAt` | INTEGER | Unix ms |

Один користувач може зберегти кілька пояснень для того самого речення (різні `id`).

## TypeScript тип

```ts
export interface SentenceExplanationRecord {
  id: string;
  userId: string;
  sentence: string;
  explanation: string;
  translation: string;
  createdAt: number;
}
```

## Відповідність UI (`/api/explain-sentence`)

| Backend | Frontend / AI |
|---------|---------------|
| `sentence` | вхідне речення з транскрипту |
| `explanation` | `SentenceExplanationResult.meaning` |
| `translation` | окремий переклад речення (для збереження в акаунт) |

`difficultWords` з AI-відповіді поки лишаються лише в UI; при потребі можна додати в `meta` у наступних задачах.

API збереження / отримання — у наступних задачах Epic Saved AI Results.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = EXPLAIN_SENTENCE#<id>` (`v2-core/dynamodb/keys.ts`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `sentence_explanations` |
| `v2-core/types.ts` | `SentenceExplanationRecord`, `CreateSentenceExplanationInput` |
| `v2-core/dynamodb/keys.ts` | `explainSentenceSk()` для майбутнього API |

## Перевірка

```bash
# Після npm run dev (схема створюється при першому зверненні до БД)
sqlite3 data/local.db ".schema sentence_explanations"

sqlite3 data/local.db "PRAGMA table_info(sentence_explanations);"
```

Очікувані колонки: `id`, `userId`, `sentence`, `explanation`, `translation`, `createdAt`.
