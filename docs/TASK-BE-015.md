# TASK-BE-015: Отримання історії Quiz

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `GET /quiz-results` | Done (`GET /api/v2/quiz-results`) |
| Лише результати поточного користувача | Done (`requireAuth` + `userId` у запиті) |

## Endpoint

### `GET /api/v2/quiz-results`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Query parameters**

| Param | Обов'язковий | Опис |
|-------|--------------|------|
| `videoId` | ні | Фільтр результатів для конкретного відео |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "videoId": "dQw4w9WgXcQ",
      "score": 8,
      "totalQuestions": 10,
      "createdAt": 1782298468333
    }
  ]
}
```

Результати сортуються за `createdAt` (новіші спочатку).

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHORIZED` | немає токена |
| 400 | `INVALID_QUIZ_RESULT` | невалідний `videoId` у query |

## Frontend

`app/lib/v2/quizResultsApi.ts` → `listQuizResults()`  
Синхронізація з UI — у наступних задачах Epic Quiz.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/quiz-results/route.ts` | GET handler |
| `v2-core/services/quiz-result-service.ts` | `listQuizResults()` |
| `v2-core/storage/local-quiz-result-store.ts` | SQL SELECT |
| `v2-core/validation/quiz-result-input.ts` | валідація `videoId` filter |
| `backend/src/handlers/quiz-results/list.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

# Уся історія quiz
curl -s http://localhost:3000/api/v2/quiz-results \
  -H "Authorization: Bearer $TOKEN"

# Результати одного відео
curl -s "http://localhost:3000/api/v2/quiz-results?videoId=dQw4w9WgXcQ" \
  -H "Authorization: Bearer $TOKEN"

sqlite3 data/local.db "SELECT id, userId, videoId, score, totalQuestions, createdAt FROM quiz_results;"
```
