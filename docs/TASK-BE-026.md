# TASK-BE-026: Перевірка доступу до Premium-функцій

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Free plan | Done — ліміт AI-запитів на день |
| Premium plan | Done — без ліміту (або налаштовуваний) |
| Обмеження кількості AI-запитів | Done — `ai_usage` + `reserveAiRequestForUser()` |

## Плани

| План | Умова | AI-ліміт |
|------|--------|----------|
| **Free** | `plan=free` або неактивна / прострочена підписка | **20** запитів/день (UTC) |
| **Premium** | `plan=premium`, `status=active`, `endDate` не минув | **без ліміту** |
| **Trial** | `plan=trial`, `status=trialing`, `endDate` не минув | як Premium |

Налаштування через env:

```env
FREE_AI_DAILY_LIMIT=20
PREMIUM_AI_DAILY_LIMIT=unlimited
```

## Перевірка доступу

### `GET /api/v2/subscription`

Повертає поточний план і використання AI:

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "plan": "free",
    "status": "inactive",
    "isPremium": false,
    "subscription": {
      "userId": "uuid",
      "plan": "free",
      "status": "inactive",
      "startDate": null,
      "endDate": null
    },
    "aiUsage": {
      "limit": 20,
      "used": 3,
      "remaining": 17,
      "periodKey": "2026-06-08"
    }
  }
}
```

Для Premium: `limit` і `remaining` = `null` (необмежено).

### AI endpoints (`/api/*`)

Усі LLM-маршрути викликають `enforceAiAccess(request)`:

- Потрібен `Authorization: Bearer <token>`
- Атомарно резервує 1 AI-запит (перевірка + інкремент)
- При перевищенні ліміту: **429** `AI_QUOTA_EXCEEDED`

## Схема `ai_usage`

```sql
CREATE TABLE ai_usage (
  userId TEXT NOT NULL,
  periodKey TEXT NOT NULL,
  requestCount INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (userId, periodKey)
);
```

`periodKey` — дата UTC (`YYYY-MM-DD`).

## Модулі

| Файл | Роль |
|------|------|
| `v2-core/premium/config.ts` | Ліміти, `periodKey` |
| `v2-core/premium/is-premium.ts` | `isPremiumSubscription()` |
| `v2-core/services/premium-access-service.ts` | `getPremiumAccess()`, `reserveAiRequestForUser()` |
| `v2-core/storage/local-ai-usage-store.ts` | SQLite лічильник |
| `app/api/_lib/ai-access.ts` | `enforceAiAccess()` для Next.js routes |
| `app/lib/aiApiClient.ts` | Frontend: JWT у AI-запитах |

## Помилки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHORIZED` | немає / невалідний токен |
| 429 | `AI_QUOTA_EXCEEDED` | денний ліміт free-плану вичерпано |

## Перевірка

```bash
TOKEN="..."

# Статус підписки та ліміт
curl -s http://localhost:3000/api/v2/subscription \
  -H "Authorization: Bearer $TOKEN"

# AI-запит (потрібен токен)
curl -s -X POST http://localhost:3000/api/explain-sentence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sentence":"Hello world"}'

# Встановити premium для тесту
sqlite3 data/local.db "INSERT INTO user_subscriptions (userId, plan, status, startDate, endDate)
  VALUES ('USER_ID', 'premium', 'active', $(date +%s000), NULL)
  ON CONFLICT(userId) DO UPDATE SET plan='premium', status='active';"
```

## Frontend

`app/lib/v2/subscriptionApi.ts` → `getSubscriptionAccess()`  
Усі AI-виклики через `fetchAiApi()` з JWT.
