import type {
  AuthenticatedContext,
  UpdateUserSettingsInput,
  UserSettingsAutoPause,
  UserSettingsRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localUserSettings from '../storage/local-user-settings-store';
import {
  DEFAULT_DAILY_CARD_GOAL,
  DEFAULT_LEARNING_LEVEL,
  DEFAULT_VOCABULARY_GOAL,
  defaultUserSettings,
  mergeUserSettings,
  parseAutoPause,
  parseStoredAutoPause,
  validateUpdateUserSettingsInput,
} from '../validation/user-settings-input';
import { userPk, userSettingsSk } from '../dynamodb/keys';
import { getItem, putItem, type DynamoItem } from '../dynamodb/repository';

interface UserSettingsItem extends DynamoItem {
  entityType: 'USER_SETTINGS';
  interfaceLanguage: string;
  translationLanguage: string;
  theme: string;
  autoPause: UserSettingsAutoPause | string;
  bilingualMode: boolean;
  dailyCardGoal?: number;
  vocabularyGoal?: number;
  learningLevel?: string;
}

function toRecord(item: UserSettingsItem): UserSettingsRecord {
  const autoPause =
    typeof item.autoPause === 'string'
      ? parseStoredAutoPause(item.autoPause)
      : parseAutoPause(item.autoPause);

  const learningLevel = item.learningLevel;
  const normalizedLevel =
    learningLevel === 'beginner' ||
    learningLevel === 'advanced' ||
    learningLevel === 'intermediate'
      ? learningLevel
      : DEFAULT_LEARNING_LEVEL;

  return {
    userId: item.userId,
    interfaceLanguage: item.interfaceLanguage,
    translationLanguage: item.translationLanguage,
    theme: item.theme,
    autoPause,
    bilingualMode: Boolean(item.bilingualMode),
    dailyCardGoal: item.dailyCardGoal ?? DEFAULT_DAILY_CARD_GOAL,
    vocabularyGoal: item.vocabularyGoal ?? DEFAULT_VOCABULARY_GOAL,
    learningLevel: normalizedLevel,
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

export async function updateUserSettings(
  auth: AuthenticatedContext,
  input: UpdateUserSettingsInput
): Promise<UserSettingsRecord> {
  const validated = validateUpdateUserSettingsInput(input);

  if (isLocalBackend()) {
    return localUserSettings.updateUserSettings(auth.userId, validated);
  }

  const existing = await getItem<UserSettingsItem>(
    userPk(auth.userId),
    userSettingsSk()
  );
  const current =
    existing && existing.userId === auth.userId
      ? toRecord(existing)
      : defaultUserSettings(auth.userId);
  const merged = mergeUserSettings(current, validated);
  const now = Date.now();

  const item: UserSettingsItem = {
    PK: userPk(auth.userId),
    SK: userSettingsSk(),
    entityType: 'USER_SETTINGS',
    userId: auth.userId,
    interfaceLanguage: merged.interfaceLanguage,
    translationLanguage: merged.translationLanguage,
    theme: merged.theme,
    autoPause: merged.autoPause,
    bilingualMode: merged.bilingualMode,
    dailyCardGoal: merged.dailyCardGoal,
    vocabularyGoal: merged.vocabularyGoal,
    learningLevel: merged.learningLevel,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}
