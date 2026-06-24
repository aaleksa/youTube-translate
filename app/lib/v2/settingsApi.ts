import type {
  UpdateUserSettingsInput,
  UserSettingsRecord,
} from '../../../v2-core/types';
import { apiGet, apiPut } from './apiClient';

export async function getUserSettings(): Promise<UserSettingsRecord> {
  return apiGet<UserSettingsRecord>('/settings');
}

export async function updateUserSettings(
  input: UpdateUserSettingsInput
): Promise<UserSettingsRecord> {
  return apiPut<UserSettingsRecord>('/settings', input);
}
