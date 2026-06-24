# TASK-BE-002: Google Login

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Sign in with Google is supported | Done |
| First sign-in creates a user | Done |
| Repeat sign-in uses existing account | Done |
| Hidden when Google client ID is not configured | Done |

## Flow

1. User clicks **Continue with Google** in the auth panel (login / sign-up).
2. `@react-oauth/google` returns a Google **ID token** in the browser.
3. Frontend sends `POST /api/v2/auth/google` with `{ "idToken": "..." }`.
4. Server verifies the token with `google-auth-library` (`GOOGLE_CLIENT_ID`).
5. Server finds user by `googleId`, or by email (links account), or creates a new user.
6. Server returns local JWT tokens (same as email/password login).

## Database

`users` table extended with:

- `googleId` — unique Google `sub`
- `authProvider` — `local` | `google` | `both`
- `passwordHash` — empty string for Google-only users

## Configuration

Add to `.env.local` when you have Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Without these variables the Google button is **not shown**.

Google Cloud Console:

- Application type: **Web application**
- Authorized JavaScript origins: `http://localhost:3000` (and production URL)
- No redirect URI needed for One Tap / Google Sign-In button (ID token flow)

## API

### `POST /api/v2/auth/google`

**Request**

```json
{ "idToken": "<google-id-token>" }
```

**Response** — same as `POST /api/v2/auth/login` (`accessToken`, `refreshToken`, …).

**Errors**

- `503 GOOGLE_NOT_CONFIGURED` — server missing `GOOGLE_CLIENT_ID`
- `401` — invalid or expired Google token

### `GET /api/v2/status`

Includes `googleAuth: true | false`.

## Account linking

If a user already registered with the same email via password, the first Google sign-in links `googleId` and sets `authProvider` to `both`. They can then use either method.

## Scope

- **Local backend only** (`STORAGE_BACKEND=local`). Cognito Google federation is a future task.
- AWS / Cognito mode returns `503 GOOGLE_NOT_SUPPORTED`.

## Files

| Area | Path |
|------|------|
| Google config | `v2-core/auth/google-config.ts` |
| Token verification | `v2-core/auth/google-verify.ts` |
| Local auth store | `v2-core/storage/local-auth-store.ts` |
| Auth service | `v2-core/services/auth-service.ts` |
| API route | `app/api/v2/auth/google/route.ts` |
| UI button | `app/components/auth/GoogleSignInButton.tsx` |
| Auth panel | `app/components/auth/AuthPanel.tsx` |
