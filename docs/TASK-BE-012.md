# TASK-BE-012: API отримання закладок

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `GET /bookmarks` | Done (`GET /api/v2/bookmarks`) |
| Лише закладки поточного користувача | Done (`requireAuth` + `userId` у запиті) |

## Endpoint

### `GET /api/v2/bookmarks`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Query parameters**

| Param | Обов'язковий | Опис |
|-------|--------------|------|
| `videoId` | ні | Фільтр закладок для конкретного відео |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "videoId": "dQw4w9WgXcQ",
      "timestamp": 42.5,
      "note": "Important phrase",
      "createdAt": 1782298468333
    }
  ]
}
```

Без `videoId` — усі закладки користувача, сортовані за `videoId`, потім `timestamp`.

З `?videoId=...` — лише закладки цього відео, сортовані за `timestamp`.

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHORIZED` | немає токена |
| 400 | `INVALID_BOOKMARK` | невалідний `videoId` у query |

## Frontend

`app/lib/v2/bookmarksApi.ts` → `listBookmarks()`  
Використовується в `bootstrapBookmarksSync()` при вході.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/bookmarks/route.ts` | GET handler |
| `v2-core/services/bookmark-service.ts` | `listBookmarks()` |
| `v2-core/storage/local-bookmark-store.ts` | SQL SELECT |
| `v2-core/validation/bookmark-input.ts` | валідація `videoId` filter |
| `backend/src/handlers/bookmarks/list.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

# Усі закладки
curl -s http://localhost:3000/api/v2/bookmarks \
  -H "Authorization: Bearer $TOKEN"

# Закладки одного відео
curl -s "http://localhost:3000/api/v2/bookmarks?videoId=dQw4w9WgXcQ" \
  -H "Authorization: Bearer $TOKEN"

sqlite3 data/local.db "SELECT id, userId, videoId, timestamp, note FROM bookmarks;"
```
