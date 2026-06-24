# TASK-BE-020: Таблиця User Settings

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Поля: `userId`, `interfaceLanguage`, `translationLanguage`, `theme`, `autoPause`, `bilingualMode` | Done |
| Один запис на користувача | Done (`userId` PRIMARY KEY) |

## Схема SQLite

```sql
CREATE TABLE user_settings (
  userId TEXT PRIMARY KEY,
  interfaceLanguage TEXT NOT NULL DEFAULT 'uk',
  translationLanguage TEXT NOT NULL DEFAULT 'uk',
  theme TEXT NOT NULL DEFAULT 'light',
  autoPause TEXT NOT NULL DEFAULT '{}',
  bilingualMode INTEGER NOT NULL DEFAULT 0
);
```

| Поле | Тип | Опис |
|------|-----|------|
| `userId` | TEXT | Власник (з JWT), первинний ключ |
| `interfaceLanguage` | TEXT | Мова UI (`uk`, `en`, …) |
| `translationLanguage` | TEXT | Мова перекладу |
| `theme` | TEXT | `light` або `dark` |
| `autoPause` | TEXT | JSON з прапорцями автопаузи |
| `bilingualMode` | INTEGER | `0` / `1` — двомовний режим транскрипту |

### Формат `autoPause` (JSON)

```json
{
  "explainSentence": false,
  "translateSelection": false,
  "grammarAnalysis": false,
  "quiz": false
}
```

## TypeScript тип

```ts
export interface UserSettingsRecord {
  userId: string;
  interfaceLanguage: string;
  translationLanguage: string;
  theme: string;
  autoPause: UserSettingsAutoPause;
  bilingualMode: boolean;
}
```

## Відповідність UI (localStorage)

| Backend | Frontend |
|---------|----------|
| `interfaceLanguage` | `app/lib/languageSettings.ts` |
| `translationLanguage` | `app/lib/languageSettings.ts` |
| `theme` | `localStorage.theme` (`ThemeProvider`) |
| `autoPause` | `app/lib/learningSettings.ts` |
| `bilingualMode` | двомовний режим у `TranscriptDisplay` |

API синхронізації — у наступних задачах Epic User Settings.

## DynamoDB (AWS mode)

Ключі підготовлені: `PK = USER#<userId>`, `SK = USER_SETTINGS` (`v2-core/dynamodb/keys.ts`).

> Не плутати з `ENTITY.PROFILE` / `/api/v2/progress` — це інші сутності.

## Файли

| Файл | Роль |
|------|------|
| `v2-core/storage/local-db.ts` | Схема таблиці `user_settings` |
| `v2-core/types.ts` | `UserSettingsRecord`, `UpdateUserSettingsInput` |
| `v2-core/dynamodb/keys.ts` | `userSettingsSk()` для майбутнього API |

## Перевірка

```bash
sqlite3 data/local.db ".schema user_settings"

sqlite3 data/local.db "PRAGMA table_info(user_settings);"
```

Очікувані колонки: `userId`, `interfaceLanguage`, `translationLanguage`, `theme`, `autoPause`, `bilingualMode`.
