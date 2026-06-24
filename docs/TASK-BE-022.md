# TASK-BE-022: API оновлення налаштувань

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `PUT /settings` | Done (`PUT /api/v2/settings`) |
| Оновлення / створення налаштувань | Done (upsert по `userId`) |
| Валідація даних | Done |
| Прив'язка до `userId` | Done (JWT → `auth.userId`) |

## Endpoint

### `PUT /api/v2/settings`

**Auth:** `Authorization: Bearer <token>` (обов'язково)

**Request body** (часткове оновлення — хоча б одне поле)

```json
{
  "interfaceLanguage": "en",
  "translationLanguage": "uk",
  "theme": "dark",
  "autoPause": {
    "explainSentence": true,
    "quiz": false
  },
  "bilingualMode": true
}
```

| Поле | Обов'язкове | Опис |
|------|-------------|------|
| `interfaceLanguage` | ні | `uk`, `en`, `pl`, `es`, `de`, `fr` |
| `translationLanguage` | ні | ті самі коди |
| `theme` | ні | `light` або `dark` |
| `autoPause` | ні | частковий об'єкт з boolean-полями |
| `bilingualMode` | ні | `true` / `false` |

Непередані поля **зберігають** попереднє значення. `autoPause` мержиться з існуючим.

**Response `200`** — повний `UserSettingsRecord` після збереження.

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `INVALID_USER_SETTINGS` | порожнє тіло або невалідні значення |
| 401 | `UNAUTHORIZED` | немає токена |

## Frontend

`app/lib/v2/settingsApi.ts` → `updateUserSettings()`  
Синхронізація з localStorage — у наступних задачах.

## Файли

| Файл | Роль |
|------|------|
| `app/api/v2/settings/route.ts` | PUT handler |
| `v2-core/services/user-settings-service.ts` | `updateUserSettings()` |
| `v2-core/storage/local-user-settings-store.ts` | SQL upsert |
| `v2-core/validation/user-settings-input.ts` | валідація + merge |
| `backend/src/handlers/settings/put.ts` | AWS Lambda |

## Перевірка

```bash
TOKEN="..."

curl -s -X PUT http://localhost:3000/api/v2/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","autoPause":{"explainSentence":true}}'

curl -s http://localhost:3000/api/v2/settings \
  -H "Authorization: Bearer $TOKEN"

sqlite3 data/local.db "SELECT * FROM user_settings;"
```
