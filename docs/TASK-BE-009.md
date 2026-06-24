# TASK-BE-009: Видалення Flashcard

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `DELETE /flashcards/{id}` | Done (`DELETE /api/v2/flashcards/:id`) |
| Неможливо видалити чужу картку | Done (`404 Not Found`) |

## Endpoint

### `DELETE /api/v2/flashcards/:id`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Response `200`**

```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Захист власності

Видалення дозволене **лише власнику** картки:

| Backend | Механізм |
|---------|----------|
| SQLite | `WHERE id = ? AND userId = ?` (userId з JWT) |
| DynamoDB | `PK = USER#<auth.userId>` + перевірка `existing.userId` |

Спроба видалити картку іншого користувача (навіть знаючи UUID) повертає **`404 Flashcard not found`**, а не `403` — щоб не розкривати існування чужих записів.

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_FLASHCARD_ID` | порожній або невалідний `id` |
| 401 | `UNAUTHORIZED` | немає токена |
| 404 | `NOT_FOUND` | картка не знайдена або не належить користувачу |

## Frontend

`removeFlashcard()` у `app/lib/flashcards.ts` викликає `DELETE` через `app/lib/v2/flashcardsApi.ts` (коли користувач авторизований).

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/flashcards/[id]/route.ts` | DELETE handler |
| `v2-core/services/flashcard-service.ts` | ownership check |
| `v2-core/storage/local-flashcard-store.ts` | SQL delete |
| `v2-core/validation/flashcard-id.ts` | валідація `id` |
| `backend/src/handlers/flashcards/delete.ts` | AWS Lambda handler |

## Перевірка

```bash
TOKEN_USER_A="..."
TOKEN_USER_B="..."
CARD_ID="uuid-of-user-a-card"

# OK — власник видаляє свою картку
curl -s -X DELETE "http://localhost:3000/api/v2/flashcards/$CARD_ID" \
  -H "Authorization: Bearer $TOKEN_USER_A"

# 404 — інший користувач не може видалити
curl -s -X DELETE "http://localhost:3000/api/v2/flashcards/$CARD_ID" \
  -H "Authorization: Bearer $TOKEN_USER_B"
```
