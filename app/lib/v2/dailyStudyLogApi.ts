import type {
  DailyStudyLogRecord,
  UpsertDailyStudyLogInput,
} from '../../../v2-core/types';
import { apiGet, apiPut } from './apiClient';

export async function listDailyStudyLog(): Promise<DailyStudyLogRecord[]> {
  return apiGet<DailyStudyLogRecord[]>('/daily-study-log');
}

export async function upsertDailyStudyLog(
  input: UpsertDailyStudyLogInput
): Promise<DailyStudyLogRecord> {
  return apiPut<DailyStudyLogRecord>('/daily-study-log', input);
}
