# TASK-BE-005: Збереження останньої позиції відтворення

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `userId`, `videoId`, `lastPosition`, `updatedAt` | Done |
| Користувач може продовжити перегляд з останнього місця | Done |
| Позиція автоматично оновлюється | Done (debounce 5 с + при паузі) |

## Модель даних

Зберігається в таблиці `items`:

| Ключ | Значення |
|------|----------|
| `PK` | `USER#<userId>` |
| `SK` | `PLAYBACK#<videoId>` |
| `entityType` | `PLAYBACK` |

```ts
interface PlaybackPositionRecord {
  userId: string;
  videoId: string;
  lastPosition: number; // секунди
  updatedAt: number;    // Unix ms
}
```

## API

Усі маршрути вимагають `Authorization: Bearer <token>`.

### `GET /api/v2/playback-position/:videoId`

Повертає збережену позицію. Якщо запису немає — `lastPosition: 0`.

### `PUT /api/v2/playback-position`

Створити або оновити позицію (upsert).

**Request**

```json
{
  "videoId": "abc123",
  "lastPosition": 125.4
}
```

## Frontend

- `app/lib/v2/playbackPositionApi.ts` — API client
- `app/lib/v2/syncPlaybackPosition.ts` — debounced sync (кожні 5 с, мін. 3 с позиція)
- `app/page.tsx` — автозбереження під час перегляду, відновлення при завантаженні відео

Потрібен **вхід в акаунт**. Без авторизації позиція не синхронізується.

При відкритті відео плеєр перемотується на збережену позицію (без автоплею) і показує повідомлення «Продовжено з …».

## Файли

| Файл | Роль |
|------|------|
| `v2-core/types.ts` | `PlaybackPositionRecord` |
| `v2-core/dynamodb/keys.ts` | `PLAYBACK#` sort key |
| `v2-core/services/playback-position-service.ts` | get / save |
| `app/api/v2/playback-position/` | API routes |
| `app/lib/v2/syncPlaybackPosition.ts` | Client sync |

## Перевірка

```bash
TOKEN="..."

curl -s -X PUT http://localhost:3000/api/v2/playback-position \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"abc123","lastPosition":90.5}'

curl -s http://localhost:3000/api/v2/playback-position/abc123 \
  -H "Authorization: Bearer $TOKEN"

sqlite3 data/local.db "SELECT SK, data FROM items WHERE SK LIKE 'PLAYBACK#%';"
```
