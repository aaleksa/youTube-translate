# TASK-BE-013: Видалення закладки

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `DELETE /bookmarks/{id}` | Done (`DELETE /api/v2/bookmarks/:id`) |
| Неможливо видалити чужу закладку | Done (`404 Not Found`) |

## Endpoint

### `DELETE /api/v2/bookmarks/:id`

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

Видалення дозволене **лише власнику** закладки:

| Backend | Механізм |
|---------|----------|
| SQLite | `WHERE id = ? AND userId = ?` (userId з JWT) |
| DynamoDB | `PK = USER#<auth.userId>` + перевірка `existing.userId` |

Спроба видалити закладку іншого користувача (навіть знаючи UUID) повертає **`404 Bookmark not found`**, а не `403` — щоб не розкривати існування чужих записів.

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_BOOKMARK_ID` | порожній або невалідний `id` |
| 401 | `UNAUTHORIZED` | немає токена |
| 404 | `NOT_FOUND` | закладка не знайдена або не належить користувачу |

## Frontend

`removeBookmark()` та `clearBookmarksForVideo()` у `app/lib/bookmarks.ts` викликають `DELETE` через `app/lib/v2/bookmarksApi.ts` (коли користувач авторизований).

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/bookmarks/[id]/route.ts` | DELETE handler |
| `v2-core/services/bookmark-service.ts` | ownership check |
| `v2-core/storage/local-bookmark-store.ts` | SQL delete |
| `v2-core/validation/bookmark-id.ts` | валідація `id` |
| `backend/src/handlers/bookmarks/delete.ts` | AWS Lambda handler |

## Перевірка

```bash
TOKEN_USER_A="..."
TOKEN_USER_B="..."
BOOKMARK_ID="uuid-of-user-a-bookmark"

# OK — власник видаляє свою закладку
curl -s -X DELETE "http://localhost:3000/api/v2/bookmarks/$BOOKMARK_ID" \
  -H "Authorization: Bearer $TOKEN_USER_A"

# 404 — інший користувач не може видалити
curl -s -X DELETE "http://localhost:3000/api/v2/bookmarks/$BOOKMARK_ID" \
  -H "Authorization: Bearer $TOKEN_USER_B"
```
