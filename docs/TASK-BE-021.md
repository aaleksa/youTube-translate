# TASK-BE-021: API отримання налаштувань

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `GET /settings` | Done (`GET /api/v2/settings`) |
| Лише налаштування поточного користувача | Done (`requireAuth` + `userId`) |

## Endpoint

### `GET /api/v2/settings`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Response `200`**

```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "interfaceLanguage": "uk",
    "translationLanguage": "uk",
    "theme": "light",
    "autoPause": {
      "explainSentence": false,
      "translateSelection": false,
      "grammarAnalysis": false,
      "quiz": false
    },
    "bilingualMode": false
  }
}
```

Якщо запис у БД ще не створено — повертаються **дефолтні** налаштування для `userId` з JWT (не `404`).

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHORIZED` | немає токена |

## Frontend

`app/lib/v2/settingsApi.ts` → `getUserSettings()`  
Синхронізація з localStorage — у наступних задачах Epic User Settings.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/settings/route.ts` | GET handler |
| `v2-core/services/user-settings-service.ts` | `getUserSettings()` |
| `v2-core/storage/local-user-settings-store.ts` | SQL SELECT |
| `v2-core/validation/user-settings-input.ts` | дефолти + parse `autoPause` |
| `backend/src/handlers/settings/get.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

curl -s http://localhost:3000/api/v2/settings \
  -H "Authorization: Bearer $TOKEN"

sqlite3 data/local.db "SELECT * FROM user_settings;"
```
