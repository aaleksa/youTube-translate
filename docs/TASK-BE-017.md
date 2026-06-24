# TASK-BE-017: Оновлення прогресу слова

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `PUT /vocabulary-progress` | Done (`PUT /api/v2/vocabulary-progress`) |
| Upsert прогресу по слову | Done |
| Валідація даних | Done |
| Прив'язка до `userId` | Done (JWT → `auth.userId`) |

## Endpoint

### `PUT /api/v2/vocabulary-progress`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Request body**

```json
{
  "word": "hello",
  "reviewCount": 5,
  "mastered": false,
  "lastReviewDate": 1782298468333
}
```

| Поле | Обов'язкове | Опис |
|------|-------------|------|
| `word` | так | Слово (нормалізується: trim, lowercase) |
| `reviewCount` | так | Кількість повторень (≥ 0) |
| `mastered` | так | `true` / `false` |
| `lastReviewDate` | ні | Unix ms останнього review; `null` — очистити |

Якщо запис для `(userId, word)` вже є — **оновлюється**; інакше — **створюється** з новим `id`.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "word": "hello",
    "reviewCount": 5,
    "mastered": false,
    "lastReviewDate": 1782298468333
  }
}
```

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_VOCABULARY_PROGRESS` | невалідне тіло запиту |
| 401 | `UNAUTHORIZED` | немає токена |

## Frontend

`app/lib/v2/vocabularyProgressApi.ts` → `upsertVocabularyProgress()`  
Синхронізація з flashcards/SRS — у наступних задачах.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/vocabulary-progress/route.ts` | PUT handler |
| `v2-core/services/vocabulary-progress-service.ts` | upsert local / DynamoDB |
| `v2-core/storage/local-vocabulary-progress-store.ts` | SQL upsert |
| `v2-core/validation/vocabulary-progress-input.ts` | валідація |
| `backend/src/handlers/vocabulary-progress/upsert.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

curl -s -X PUT http://localhost:3000/api/v2/vocabulary-progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","reviewCount":3,"mastered":false,"lastReviewDate":1782298468333}'

# Повторний PUT — оновлення того ж слова
curl -s -X PUT http://localhost:3000/api/v2/vocabulary-progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","reviewCount":7,"mastered":true,"lastReviewDate":1782299000000}'

sqlite3 data/local.db "SELECT id, userId, word, reviewCount, mastered, lastReviewDate FROM vocabulary_progress;"
```
