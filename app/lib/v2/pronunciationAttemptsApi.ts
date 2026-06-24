import type {
  CreatePronunciationAttemptInput,
  PronunciationAttemptRecord,
} from '../../../v2-core/types';
import { apiGet, apiPost } from './apiClient';

export async function listPronunciationAttempts(): Promise<
  PronunciationAttemptRecord[]
> {
  return apiGet<PronunciationAttemptRecord[]>('/pronunciation-attempts');
}

export async function createPronunciationAttempt(
  input: CreatePronunciationAttemptInput
): Promise<PronunciationAttemptRecord> {
  return apiPost<PronunciationAttemptRecord>('/pronunciation-attempts', input);
}
