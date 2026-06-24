import type {
  AuthenticatedContext,
  UserSettingsAutoPause,
  UserSettingsRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localUserSettings from '../storage/local-user-settings-store';
import {
  defaultUserSettings,
  parseAutoPause,
  parseStoredAutoPause,
} from '../validation/user-settings-input';
import { userPk, userSettingsSk } from '../dynamodb/keys';
import { getItem, type DynamoItem } from '../dynamodb/repository';

interface UserSettingsItem extends DynamoItem {
  entityType: 'USER_SETTINGS';
  interfaceLanguage: string;
  translationLanguage: string;
  theme: string;
  autoPause: UserSettingsAutoPause | string;
  bilingualMode: boolean;
}

function toRecord(item: UserSettingsItem): UserSettingsRecord {
  const autoPause =
    typeof item.autoPause === 'string'
      ? parseStoredAutoPause(item.autoPause)
      : parseAutoPause(item.autoPause);

  return {
    userId: item.userId,
    interfaceLanguage: item.interfaceLanguage,
    translationLanguage: item.translationLanguage,
    theme: item.theme,
    autoPause,
    bilingualMode: Boolean(item.bilingualMode),
  };
}

export async function getUserSettings(
  auth: AuthenticatedContext
): Promise<UserSettingsRecord> {
  if (isLocalBackend()) {
    return localUserSettings.getUserSettings(auth.userId);
  }

  const item = await getItem<UserSettingsItem>(
    userPk(auth.userId),
    userSettingsSk()
  );

  if (!item || item.userId !== auth.userId) {
    return defaultUserSettings(auth.userId);
  }

  return toRecord(item);
}
