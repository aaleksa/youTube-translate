# TASK-BE-001: Authentication & Authorization

**Epic:** Backend & User Accounts (V2)  
**Status:** ✅ Done (local mode) · ⏳ AWS Cognito ready (not deployed)

## User Story

> Як користувач, я хочу мати власний акаунт, щоб мої дані зберігалися між сесіями.

---

## Acceptance Criteria

| # | Критерій | Статус | Реалізація |
|---|----------|--------|------------|
| 1 | **Sign Up** | ✅ | `POST /api/v2/auth/signup` |
| 2 | **Login** | ✅ | `POST /api/v2/auth/login` → JWT tokens |
| 3 | **Logout** | ✅ | `POST /api/v2/auth/logout` + очищення токенів на клієнті |
| 4 | **JWT перевірка на бекенді** | ✅ | `requireAuth()` → `verifyAccessToken()` |
| 5 | **Захищені API лише для авторизованих** | ✅ | `401` без `Authorization: Bearer` |

---

## Архітектура (поточна)

```text
Frontend (AuthPanel, AuthProvider)
    ↓ Bearer JWT
/api/v2/*  (Next.js API Routes)
    ↓
v2-core/services/auth-service.ts
    ↓
┌─────────────────┬──────────────────────┐
│  local (SQLite) │  dynamodb (Cognito)  │
│  bcrypt + jose  │  AWS SDK (later)     │
└─────────────────┴──────────────────────┘
```

**За замовчуванням:** `STORAGE_BACKEND=local` (без AWS).

---

## API Endpoints

### Public (без токена)

| Method | Path | Опис |
|--------|------|------|
| POST | `/api/v2/auth/signup` | Реєстрація |
| POST | `/api/v2/auth/login` | Вхід → `{ accessToken, refreshToken, idToken, expiresIn }` |
| POST | `/api/v2/auth/refresh` | Оновлення access token |
| POST | `/api/v2/auth/logout` | Вихід (інвалідація refresh token) |
| GET | `/api/v2/status` | Режим backend: `local` / `dynamodb` |

### Protected (потрібен `Authorization: Bearer <token>`)

| Method | Path | Опис |
|--------|------|------|
| GET | `/api/v2/me` | `{ userId, email }` |
| GET | `/api/v2/flashcards` | Список карток користувача |
| POST | `/api/v2/flashcards` | Створити картку |
| PUT | `/api/v2/flashcards/{id}` | Оновити картку |
| DELETE | `/api/v2/flashcards/{id}` | Видалити картку |
| GET | `/api/v2/decks` | Колоди |
| GET | `/api/v2/progress` | Прогрес навчання |

### Вимкнено до підключення email (SendGrid / Cognito)

| Method | Path | Умова |
|--------|------|-------|
| POST | `/api/v2/auth/confirm` | `EMAIL_VERIFICATION_ENABLED=true` |
| POST | `/api/v2/auth/forgot-password` | `EMAIL_VERIFICATION_ENABLED=true` |
| POST | `/api/v2/auth/confirm-forgot-password` | `EMAIL_VERIFICATION_ENABLED=true` |

---

## Ключові файли

| Шар | Файли |
|-----|-------|
| UI | `app/components/auth/AuthProvider.tsx`, `AuthPanel.tsx`, `AuthButton.tsx` |
| API client | `app/lib/v2/apiClient.ts`, `authApi.ts`, `tokenStorage.ts` |
| Routes | `app/api/v2/auth/*`, `app/api/v2/me/route.ts` |
| Auth logic | `v2-core/services/auth-service.ts`, `storage/local-auth-store.ts` |
| JWT | `v2-core/auth/jwt-verifier.ts`, `auth/local-jwt.ts` |
| Middleware | `v2-core/http/request.ts` → `requireAuth()` |
| DB (local) | `v2-core/storage/local-db.ts` → `data/local.db` |

---

## Env змінні

```env
STORAGE_BACKEND=local
LOCAL_DB_PATH=data/local.db
LOCAL_AUTH_SECRET=your-secret
NEXT_PUBLIC_BACKEND_V2_ENABLED=true
NEXT_PUBLIC_STORAGE_BACKEND=local
EMAIL_VERIFICATION_ENABLED=false
NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED=false
```

---

## Як перевірити вручну

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/v2/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:3000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Protected без токена → 401
curl http://localhost:3000/api/v2/flashcards

# 4. Protected з токеном → 200
curl http://localhost:3000/api/v2/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## Що ще НЕ входить у TASK-BE-001

| Задача | Статус |
|--------|--------|
| Синхронізація V1 localStorage → V2 API | ❌ TASK-BE-007 |
| Flashcards UI → V2 API замість localStorage | ❌ TASK-BE-003 |
| AWS Cognito deploy | ❌ очікує налаштування AWS |
| Email confirmation (SendGrid) | ❌ вимкнено навмисно |

---

## Підсумок

**TASK-BE-001 виконано** для локального режиму розробки:

- акаунт створюється і зберігається в SQLite;
- сесія тримається через JWT у `localStorage`;
- захищені endpoint-и повертають `401` без валідного токена;
- код готовий до перемикання на Cognito (`STORAGE_BACKEND=dynamodb`).

Детальніше про local backend: [LOCAL_BACKEND.md](./LOCAL_BACKEND.md)
