# TASK-BE-011: API створення закладки

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `POST /bookmarks` | Done (`POST /api/v2/bookmarks`) |
| Створення закладки | Done |
| Валідація даних | Done |
| Прив'язка до `userId` | Done (JWT → `auth.userId`) |

## Endpoint

### `POST /api/v2/bookmarks`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Request body**

```json
{
  "videoId": "dQw4w9WgXcQ",
  "timestamp": 42.5,
  "note": "Important phrase here"
}
```

| Поле | Обов'язкове | Опис |
|------|-------------|------|
| `videoId` | так | YouTube video ID |
| `timestamp` | так | Позиція у відео (секунди, ≥ 0) |
| `note` | ні | Текст закладки (у UI — `label`) |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "videoId": "dQw4w9WgXcQ",
    "timestamp": 42.5,
    "note": "Important phrase here",
    "createdAt": 1782298468333
  }
}
```

## Валідація

| Правило | Помилка |
|---------|---------|
| `videoId` порожній | `400 INVALID_BOOKMARK` |
| `videoId` невалідний формат | `400 INVALID_BOOKMARK` |
| `timestamp` не число або < 0 | `400 INVALID_BOOKMARK` |
| `note` > 500 символів | `400 INVALID_BOOKMARK` |
| Дублікат у ±0.5 с на тому ж відео | `409 CONFLICT` |

Дублікат перевіряється так само, як у UI (`app/lib/bookmarks.ts`).

## Відповідність UI

| API | Frontend |
|-----|----------|
| `timestamp` | `seconds` |
| `note` | `label` |

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/bookmarks/route.ts` | POST handler |
| `v2-core/services/bookmark-service.ts` | local / DynamoDB |
| `v2-core/storage/local-bookmark-store.ts` | INSERT у `bookmarks` |
| `v2-core/validation/bookmark-input.ts` | Валідація |
| `backend/src/handlers/bookmarks/create.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

curl -s -X POST http://localhost:3000/api/v2/bookmarks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"dQw4w9WgXcQ","timestamp":42.5,"note":"Test bookmark"}'

sqlite3 data/local.db "SELECT id, userId, videoId, timestamp, note, createdAt FROM bookmarks;"
```
