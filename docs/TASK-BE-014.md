# TASK-BE-014: Збереження результатів Quiz

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `videoId`, `score`, `totalQuestions`, `createdAt` | Done |
| Результати прив'язані до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE quiz_results (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  videoId TEXT NOT NULL,
  score INTEGER NOT NULL,
  totalQuestions INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE INDEX idx_quiz_results_user ON quiz_results(userId);
CREATE INDEX idx_quiz_results_user_video ON quiz_results(userId, videoId);
CREATE INDEX idx_quiz_results_user_created ON quiz_results(userId, createdAt);
```

| Поле | Тип | Опис |
|------|-----|------|
| `id` | TEXT | UUID результату |
| `userId` | TEXT | Власник (з JWT) |
| `videoId` | TEXT | YouTube video ID |
| `score` | INTEGER | Кількість правильних відповідей |
| `totalQuestions` | INTEGER | Загальна кількість питань |
| `createdAt` | INTEGER | Unix ms |

## TypeScript тип

```ts
export interface QuizResultRecord {
  id: string;
  userId: string;
  videoId: string;
  score: number;
  totalQuestions: number;
  createdAt: number;
}
```

## Відповідність UI (video quiz)

| Backend | Frontend (`app/lib/videoQuiz.ts`) |
|---------|-----------------------------------|
| `score` | `correct` |
| `totalQuestions` | `total` |

`percentage` обчислюється на клієнті: `Math.round((score / totalQuestions) * 100)`.

API та синхронізація — у наступних задачах Epic Quiz.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = QUIZ_RESULT#<id>` (`v2-core/dynamodb/keys.ts`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `quiz_results` |
| `v2-core/types.ts` | `QuizResultRecord`, `CreateQuizResultInput` |
| `v2-core/dynamodb/keys.ts` | `quizResultSk()` для майбутнього API |

## Перевірка

```bash
# Після npm run dev (схема створюється при першому зверненні до БД)
sqlite3 data/local.db ".schema quiz_results"

sqlite3 data/local.db "PRAGMA table_info(quiz_results);"
```

Очікувані колонки: `id`, `userId`, `videoId`, `score`, `totalQuestions`, `createdAt`.
