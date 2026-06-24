# TASK-BE-019: Збереження Analyze Selection

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `id`, `userId`, `selectedText`, `analysis`, `createdAt` | Done |
| Результати прив'язані до користувача | Done (`userId` + індекс) |

## Схема SQLite

```sql
CREATE TABLE selection_analyses (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  selectedText TEXT NOT NULL,
  analysis TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE INDEX idx_selection_analyses_user ON selection_analyses(userId);
CREATE INDEX idx_selection_analyses_user_created ON selection_analyses(userId, createdAt);
```

| Поле | Тип | Опис |
|------|-----|------|
| `id` | TEXT | UUID запису |
| `userId` | TEXT | Власник (з JWT) |
| `selectedText` | TEXT | Виділений фрагмент транскрипту |
| `analysis` | TEXT | Текст AI-аналізу |
| `createdAt` | INTEGER | Unix ms |

Один користувач може зберегти кілька аналізів для того самого тексту (різні `id`).

## TypeScript тип

```ts
export interface SelectionAnalysisRecord {
  id: string;
  userId: string;
  selectedText: string;
  analysis: string;
  createdAt: number;
}
```

## Відповідність UI (`SelectionAnalysis`)

| Backend | Frontend |
|---------|----------|
| `selectedText` | виділений текст у транскрипті |
| `analysis` | `data.result` з `/api/process-text` |

API збереження / отримання — у наступних задачах Epic Saved AI Results.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = SELECTION_ANALYSIS#<id>` (`v2-core/dynamodb/keys.ts`).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `selection_analyses` |
| `v2-core/types.ts` | `SelectionAnalysisRecord`, `CreateSelectionAnalysisInput` |
| `v2-core/dynamodb/keys.ts` | `selectionAnalysisSk()` для майбутнього API |

## Перевірка

```bash
# Після npm run dev (схема створюється при першому зверненні до БД)
sqlite3 data/local.db ".schema selection_analyses"

sqlite3 data/local.db "PRAGMA table_info(selection_analyses);"
```

Очікувані колонки: `id`, `userId`, `selectedText`, `analysis`, `createdAt`.
