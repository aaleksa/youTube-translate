# TASK-BE-024: API слів для повторення

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `GET /reviews/today` | Done (`GET /api/v2/reviews/today`) |
| Лише картки поточного користувача | Done (`requireAuth` + `userId`) |
| Слова, готові до повторення сьогодні | Done (`nextReview <= now` або без `nextReview`) |

## Endpoint

### `GET /api/v2/reviews/today`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Response `200`**

```json
{
  "success": true,
  "data": {
    "date": 1782000000000,
    "total": 2,
    "items": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "word": "run into",
        "translation": "натрапити на",
        "example": "I ran into an old friend.",
        "videoId": "dQw4w9WgXcQ",
        "repetitions": 1,
        "ease": 2.5,
        "interval": 1,
        "nextReview": 1782000000000,
        "knownCount": 0,
        "unknownCount": 2,
        "createdAt": 1781900000000
      }
    ]
  }
}
```

- `date` — початок поточного календарного дня (Unix ms)
- `total` — кількість карток у черзі
- `items` — flashcard-записи, відсортовані для повторення

## Логіка відбору

Картка потрапляє в чергу, якщо:

- `nextReview` відсутній, або
- `nextReview <= now` (включно з 10-хвилинним `again` з TASK-BE-023)

**Сортування** (як Smart Review на UI):

1. Слабші картки (`unknownCount > knownCount`) — вище
2. Раніший `nextReview`
3. Старіші за `createdAt`

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHORIZED` | немає токена |

## Frontend

`app/lib/v2/reviewsApi.ts` → `getTodayReviews()`  
Підключення до Study Mode — у наступних задачах Epic Spaced Repetition.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/reviews/today/route.ts` | GET handler |
| `v2-core/services/review-service.ts` | `listTodayReviews()` |
| `v2-core/srs/review-queue.ts` | фільтр + сортування черги |
| `v2-core/srs/spaced-repetition.ts` | `isReviewDue()` |
| `backend/src/handlers/reviews/today.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

curl -s http://localhost:3000/api/v2/reviews/today \
  -H "Authorization: Bearer $TOKEN"
```

Очікування: `total` збігається з `items.length`; усі `items` мають `nextReview <= now` або без `nextReview`.
