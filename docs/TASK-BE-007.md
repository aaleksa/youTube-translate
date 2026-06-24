# TASK-BE-007: API створення Flashcard

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `POST /flashcards` | Done (`POST /api/v2/flashcards`) |
| Створення картки | Done |
| Валідація даних | Done |
| Прив'язка до `userId` | Done (JWT → `auth.userId`) |

## Endpoint

### `POST /api/v2/flashcards`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Request body**

```json
{
  "word": "hello",
  "translation": "привіт",
  "example": "Hello world",
  "videoId": "dQw4w9WgXcQ",
  "tags": ["greeting"],
  "deckIds": []
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "word": "hello",
    "translation": "привіт",
    "example": "Hello world",
    "videoId": "dQw4w9WgXcQ",
    "createdAt": 1782298468333,
    "tags": ["greeting"],
    "deckIds": [],
    "repetitions": 0,
    "ease": 2.5,
    "interval": 0,
    "knownCount": 0,
    "unknownCount": 0,
    "updatedAt": 1782298468333
  }
}
```

`userId` береться з JWT — клієнт **не може** передати чужий `userId`.

## Валідація

| Поле | Правила |
|------|---------|
| `word` | обов'язкове, 1–200 символів |
| `translation` | обов'язкове, 1–500 символів |
| `example` | опційно, ≤ 2000 символів |
| `videoId` | опційно, `[a-zA-Z0-9_-]+`, ≤ 20 символів |
| `tags` | опційно, масив рядків, ≤ 20 елементів |
| `deckIds` | опційно, масив рядків, ≤ 50 елементів |
| `repetitions`, `interval`, `nextReview`, `knownCount`, `unknownCount` | опційно, число ≥ 0 |
| `ease` | опційно, 1.3–5.0 |

**Дублікат:** одне слово на користувача (case-insensitive) → `409 CONFLICT`.

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_FLASHCARD` | невалідні поля |
| 400 | `INVALID_JSON` | зламаний JSON |
| 401 | `UNAUTHORIZED` | немає / прострочений токен |
| 409 | `CONFLICT` | слово вже існує |

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/flashcards/route.ts` | POST handler |
| `v2-core/services/flashcard-service.ts` | create + userId binding |
| `v2-core/validation/flashcard-input.ts` | валідація |
| `v2-core/storage/local-flashcard-store.ts` | INSERT у `flashcards` |
| `v2-core/types.ts` | `CreateFlashcardInput` |

## Перевірка

```bash
TOKEN="..."

# OK
curl -s -X POST http://localhost:3000/api/v2/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","translation":"привіт","example":"Hi!"}'

# 400 — без translation
curl -s -X POST http://localhost:3000/api/v2/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello"}'

# 409 — дублікат
curl -s -X POST http://localhost:3000/api/v2/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","translation":"привіт"}'
```
