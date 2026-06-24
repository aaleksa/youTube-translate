import type { UserSettingsRecord } from '../../../v2-core/types';
import { apiGet } from './apiClient';

export async function getUserSettings(): Promise<UserSettingsRecord> {
  return apiGet<UserSettingsRecord>('/settings');
}
