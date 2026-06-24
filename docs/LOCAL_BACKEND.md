# Local Backend (V2)

Поки AWS не налаштовано, проєкт може працювати з **локальною SQLite базою** та **локальною JWT-авторизацією**.

## Як увімкнути

У `.env.local`:

```env
STORAGE_BACKEND=local
LOCAL_DB_PATH=data/local.db
LOCAL_AUTH_SECRET=your-dev-secret
NEXT_PUBLIC_BACKEND_V2_ENABLED=true
NEXT_PUBLIC_STORAGE_BACKEND=local
```

Перезапустіть `npm run dev`.

## Що зберігається локально

| Файл / таблиця | Дані |
|----------------|------|
| `data/local.db` | Користувачі, refresh tokens, flashcards, bookmarks, quiz results, vocabulary progress, decks, progress |
| `users` | Профіль (`id`, `email`, `name`, timestamps) + auth (`passwordHash`, `googleId`, …) |
| `flashcards` | Картки (`id`, `userId`, `word`, `translation`, `example`, `videoId`, `createdAt`) |
| `bookmarks` | Закладки (`id`, `userId`, `videoId`, `timestamp`, `note`, `createdAt`) |
| `quiz_results` | Результати quiz (`id`, `userId`, `videoId`, `score`, `totalQuestions`, `createdAt`) |
| `vocabulary_progress` | Прогрес по словах (`id`, `userId`, `word`, `reviewCount`, `mastered`, `lastReviewDate`) |
| `items` | Video history, playback, decks, progress (V2 single-table entities) |

Файл `data/local.db` **не комітиться** в git (див. `.gitignore`).

## API endpoints

Ті самі `/api/v2/*`, що й для AWS:

| Endpoint | Опис |
|----------|------|
| `POST /api/v2/auth/signup` | Реєстрація |
| `POST /api/v2/auth/login` | Вхід → JWT tokens |
| `POST /api/v2/auth/refresh` | Оновлення access token |
| `POST /api/v2/auth/logout` | Вихід |
| `GET /api/v2/me` | Поточний користувач |
| `GET /api/v2/flashcards` | Картки користувача |
| `POST /api/v2/flashcards` | Створити картку |
| `GET /api/v2/decks` | Колоди |
| `GET /api/v2/progress` | Прогрес |
| `GET /api/v2/video-history` | Історія переглянутих відео |
| `POST /api/v2/video-history` | Зберегти / оновити перегляд |
| `DELETE /api/v2/video-history/:videoId` | Видалити з історії |
| `POST /api/v2/bookmarks` | Створити закладку |
| `GET /api/v2/bookmarks` | Список закладок (`?videoId=` опційно) |
| `DELETE /api/v2/bookmarks/:id` | Видалити закладку |
| `GET /api/v2/quiz-results` | Історія результатів quiz (`?videoId=` опційно) |
| `PUT /api/v2/vocabulary-progress` | Оновити / створити прогрес слова |
| `GET /api/v2/playback-position/:videoId` | Остання позиція відтворення |
| `PUT /api/v2/playback-position` | Зберегти позицію |
| `GET /api/v2/status` | Режим: `local` або `dynamodb` |

## Відмінності від AWS режиму

| Функція | Local | AWS (Cognito) |
|---------|-------|---------------|
| Реєстрація | Одразу активний акаунт, **без коду з email** | Потрібне підтвердження email |
| Підтвердження email | Вимкнено (`EMAIL_VERIFICATION_ENABLED=false`) | Увімкніть після підключення SendGrid/Cognito |
| Forgot password | Приховано, поки email не налаштовано | Email від Cognito |
| Синхронізація між пристроями | Лише на цьому комп'ютері | Через хмару |

## Перехід на AWS пізніше

1. Створити Cognito User Pool + App Client
2. Створити DynamoDB table
3. У `.env.local`:

```env
STORAGE_BACKEND=dynamodb
NEXT_PUBLIC_STORAGE_BACKEND=dynamodb
AWS_REGION=eu-west-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
DYNAMODB_TABLE_NAME=yoytube-main
```

Код V2 автоматично перемкнеться на Cognito + DynamoDB без зміни API.

## Міграція даних

Поки що автоматичної міграції з `localStorage` (V1) або з SQLite → DynamoDB немає.
Планується в **TASK-BE-007: Sync Engine**.

## Переглянути базу

```bash
sqlite3 data/local.db
.tables
SELECT id, email, name, createdAt, updatedAt FROM users;
.quit
```
