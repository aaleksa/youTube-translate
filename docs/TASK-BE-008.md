# TASK-BE-008: API отримання Flashcards

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `GET /flashcards` | Done (`GET /api/v2/flashcards`) |
| Лише картки поточного користувача | Done (`requireAuth` + `userId` у запиті) |
| Пагінація | Done (`limit`, `offset`) |

## Endpoint

### `GET /api/v2/flashcards`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Query parameters**

| Param | Default | Max | Опис |
|-------|---------|-----|------|
| `limit` | `50` | `100` | Кількість карток на сторінку |
| `offset` | `0` | — | Зміщення від початку |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "word": "hello",
        "translation": "привіт",
        "example": "Hello!",
        "videoId": "abc123",
        "createdAt": 1782298468333
      }
    ],
    "total": 120,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

Картки сортуються за `createdAt` (старіші спочатку).

## Безпека

- `userId` з JWT — повертаються **тільки** картки авторизованого користувача
- Чужі картки недоступні через API

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_PAGINATION` | невалідні `limit` / `offset` |
| 401 | `UNAUTHORIZED` | немає токена |

## Frontend

- `listFlashcards({ limit, offset })` — одна сторінка
- `listAllFlashcards()` — усі сторінки (для sync)

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/flashcards/route.ts` | GET handler |
| `v2-core/services/flashcard-service.ts` | `listFlashcards`, `listAllFlashcards` |
| `v2-core/storage/local-flashcard-store.ts` | SQL `LIMIT` / `OFFSET` |
| `v2-core/validation/pagination.ts` | парсинг query |
| `v2-core/types.ts` | `PaginatedFlashcards` |

## Перевірка

```bash
TOKEN="..."

# Перша сторінка (default limit=50)
curl -s "http://localhost:3000/api/v2/flashcards" \
  -H "Authorization: Bearer $TOKEN"

# Друга сторінка
curl -s "http://localhost:3000/api/v2/flashcards?limit=20&offset=20" \
  -H "Authorization: Bearer $TOKEN"
```
