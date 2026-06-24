import type { UserSettingsRecord } from '../types';
import {
  defaultUserSettings,
  parseStoredAutoPause,
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
