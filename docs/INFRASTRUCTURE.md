# Infrastructure (AWS) — BE-027 … BE-035

Підготовка до деплою **не блокує** local mode. Поки `STORAGE_BACKEND=local`, усе працює через Next.js `/api/v2/*` + SQLite.

## Статус задач

| Task | Що зроблено | Де |
|------|-------------|-----|
| **BE-027** DynamoDB | Single-table `PK`/`SK`, PAY_PER_REQUEST, PITR | `infra/template.yaml` |
| **BE-028** Lambda | API router + 23 окремих handlers | `v2-core/lambda/api-router.ts`, `backend/src/handlers/` |
| **BE-029** API Gateway | HTTP API, CORS, routes `/api/v2/*` | `infra/template.yaml` |
| **BE-030** JWT | Cognito authorizer на protected routes | `infra/template.yaml` + `getAuthFromApiGatewayEvent` |
| **BE-031** Error Handling | `ApiError`, `handleServiceError`, JSON `{ success, error, code }` | `v2-core/errors.ts`, `v2-core/response.ts` |
| **BE-032** Logging | Structured JSON logs | `v2-core/logging/logger.ts` |
| **BE-033** Monitoring | CloudWatch alarms (errors, duration) | `infra/template.yaml` |
| **BE-034** Rate Limiting | API GW throttling + Premium AI quota (BE-026) | `infra/template.yaml`, `ai_usage` |
| **BE-035** Cache | Client cache лише; server cache — після запуску | `app/lib/*Cache.ts` (документовано) |

## Архітектура AWS

```
Client → API Gateway HTTP API (JWT)
       → Lambda ApiFunction (api-router)
       → v2-core/services/*
       → DynamoDB (single-table)
```

Публічні маршрути (без JWT на Gateway):
- `GET /api/v2/status`
- `POST /api/v2/auth/*`

Усі інші `/api/v2/*` — Cognito JWT authorizer.

## Деплой (коли будете готові)

### Передумови

- AWS CLI + SAM CLI
- `cd backend && npm install && npm run build`

### Кроки

```bash
# 1. Зібрати Lambda bundle
cd backend
npm run build

# 2. Налаштувати SAM
cp infra/samconfig.toml.example infra/samconfig.toml
# Відредагуйте region/stack_name

# 3. Валідація (без деплою)
sam validate --template-file infra/template.yaml

# 4. Деплой
sam deploy --template-file infra/template.yaml --config-file infra/samconfig.toml
```

### Після деплою — frontend `.env`

```env
STORAGE_BACKEND=dynamodb
NEXT_PUBLIC_STORAGE_BACKEND=dynamodb
NEXT_PUBLIC_API_BASE_URL=https://xxxx.execute-api.eu-west-1.amazonaws.com/prod/api/v2
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
DYNAMODB_TABLE_NAME=...
AWS_REGION=eu-west-1
```

Усі `/api/v2/*`, включно з `POST /billing/checkout` і `POST /billing/webhook`,
реалізовані в Lambda-роутері (`v2-core/lambda/api-router.ts`) і можна перевести
на пряме звернення `NEXT_PUBLIC_API_BASE_URL` → API Gateway. Webhook-маршрут
має власний route `BillingWebhookRoute` (`Auth: Authorizer: NONE`) в
`infra/template.yaml`, бо Stripe б'є без Cognito JWT — не вішайте на нього
дефолтний authorizer.

⚠️ Legacy AI/transcript-роути (`/api/transcript`, `/api/coach-advice` тощо),
яким потрібні `yt-dlp`/OpenAI, у Lambda не переносились і завжди залишаються
на Next.js (Vercel) незалежно від `STORAGE_BACKEND`.

## Local vs AWS

| | Local (зараз) | AWS (пізніше) |
|--|---------------|---------------|
| API | Next.js routes | API Gateway + Lambda |
| Auth | Local JWT | Cognito |
| DB | SQLite | DynamoDB |
| Rate limit | middleware + AI quota | API GW throttle + AI quota |
| Logs | console | CloudWatch JSON |

## BE-035 Cache (пізніше)

Коли з’явиться навантаження:
- CloudFront перед API / static
- ElastiCache для hot reads
- DynamoDB DAX (опційно)

Зараз клієнтський cache (транскрипти, quiz, notes) достатній для MVP.

## Перевірка без AWS

```bash
cd backend && npm run build
cd .. && npm run build
```

Обидва build мають проходити — local dev не залежить від SAM.
