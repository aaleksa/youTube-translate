import { ApiError } from '../errors';
import type { UpdateUserSettingsInput, UserSettingsRecord } from '../types';
import {
  defaultUserSettings,
  mergeUserSettings,
  parseStoredAutoPause,
  validateUpdateUserSettingsInput,
} from '../validation/user-settings-input';
import { getLocalDatabase } from './local-db';

interface UserSettingsRow {
  userId: string;
  interfaceLanguage: string;
  translationLanguage: string;
  theme: string;
  autoPause: string;
  bilingualMode: number;
}

function toRecord(row: UserSettingsRow): UserSettingsRecord {
  return {
    userId: row.userId,
    interfaceLanguage: row.interfaceLanguage,
    translationLanguage: row.translationLanguage,
    theme: row.theme,
    autoPause: parseStoredAutoPause(row.autoPause),
    bilingualMode: row.bilingualMode === 1,
  };
}

export function getUserSettings(userId: string): UserSettingsRecord {
  const db = getLocalDatabase();
  const row = db
    .prepare(`SELECT * FROM user_settings WHERE userId = ?`)
    .get(userId) as UserSettingsRow | undefined;

  if (!row) {
    return defaultUserSettings(userId);
  }

  return toRecord(row);
}

export function updateUserSettings(
  userId: string,
  input: UpdateUserSettingsInput
): UserSettingsRecord {
  const validated = validateUpdateUserSettingsInput(input);
  const current = getUserSettings(userId);
  const merged = mergeUserSettings(current, validated);

  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO user_settings (
      userId, interfaceLanguage, translationLanguage, theme, autoPause, bilingualMode
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      interfaceLanguage = excluded.interfaceLanguage,
      translationLanguage = excluded.translationLanguage,
      theme = excluded.theme,
      autoPause = excluded.autoPause,
      bilingualMode = excluded.bilingualMode`
  ).run(
    userId,
    merged.interfaceLanguage,
    merged.translationLanguage,
    merged.theme,
    JSON.stringify(merged.autoPause),
    merged.bilingualMode ? 1 : 0
  );

  const row = db
    .prepare(`SELECT * FROM user_settings WHERE userId = ?`)
    .get(userId) as UserSettingsRow | undefined;

  if (!row) {
    throw new ApiError(
      'Failed to save user settings',
      500,
      'USER_SETTINGS_SAVE_FAILED'
    );
  }

  return toRecord(row);
}
