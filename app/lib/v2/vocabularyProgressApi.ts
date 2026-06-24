import type {
  UpsertVocabularyProgressInput,
  VocabularyProgressRecord,
} from '../../../v2-core/types';
import { apiPut } from './apiClient';

export async function upsertVocabularyProgress(
  input: UpsertVocabularyProgressInput
): Promise<VocabularyProgressRecord> {
  return apiPut<VocabularyProgressRecord>('/vocabulary-progress', input);
}
