# TASK-BE-004: Збереження історії відео

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `userId`, `videoId`, `title`, `url`, `channel`, `createdAt` | Done |
| Історія прив'язана до користувача | Done (`requireAuth`, `userId` у ключі) |
| При повторному перегляді запис оновлюється | Done (upsert за `userId` + `videoId`) |

## Модель даних

Зберігається в таблиці `items` (single-table design):

| Ключ | Значення |
|------|----------|
| `PK` | `USER#<userId>` |
| `SK` | `VIDEO#<videoId>` |
| `entityType` | `VIDEO` |

Один запис на пару **користувач + відео**. Повторний перегляд оновлює `title`, `url`, `channel` і `createdAt` (час останнього перегляду).

```ts
interface VideoHistoryRecord {
  userId: string;
  videoId: string;
  title: string;
  url: string;
  channel: string;
  createdAt: number; // Unix ms, оновлюється при повторному перегляді
}
```

## API

Усі маршрути вимагають `Authorization: Bearer <token>`.

### `GET /api/v2/video-history`

Список історії поточного користувача, відсортований за `createdAt` (новіші спочатку).

### `POST /api/v2/video-history`

Створити або оновити запис (upsert).

**Request**

```json
{
  "videoId": "dQw4w9WgXcQ",
  "title": "Video title",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "channel": "Channel name"
}
```

**Response** — `VideoHistoryRecord`.

### `DELETE /api/v2/video-history/:videoId`

Видалити запис з історії.

## Frontend

Клієнт: `app/lib/v2/videoHistoryApi.ts`.

Поки UI використовує `localStorage` (`app/lib/transcriptHistory.ts`). Підключення до V2 API — окрема задача (sync engine / Epic Video History UI).

## Файли

| Файл | Роль |
|------|------|
| `v2-core/types.ts` | `VideoHistoryRecord`, `RecordVideoHistoryInput` |
| `v2-core/dynamodb/keys.ts` | `VIDEO#` sort key |
| `v2-core/services/video-history-service.ts` | list / upsert / delete |
| `app/api/v2/video-history/route.ts` | GET, POST |
| `app/api/v2/video-history/[videoId]/route.ts` | DELETE |
| `app/lib/v2/videoHistoryApi.ts` | Frontend API client |

## Перевірка

```bash
# 1. Увійти та отримати token
TOKEN="..."

# 2. Зберегти перегляд
curl -s -X POST http://localhost:3000/api/v2/video-history \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"abc123","title":"Test","url":"https://youtube.com/watch?v=abc123","channel":"My Channel"}'

# 3. Список історії
curl -s http://localhost:3000/api/v2/video-history \
  -H "Authorization: Bearer $TOKEN"

# 4. Повторний перегляд (оновить createdAt)
curl -s -X POST http://localhost:3000/api/v2/video-history \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"abc123","title":"Test updated","url":"https://youtube.com/watch?v=abc123","channel":"My Channel"}'
```

SQLite:

```bash
sqlite3 data/local.db "SELECT userId, SK, data FROM items WHERE SK LIKE 'VIDEO#%';"
```
