import type { CreateFlashcardInput, FlashcardRecord } from '../../../v2-core/types';
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';

export async function listFlashcards(): Promise<FlashcardRecord[]> {
  return apiGet<FlashcardRecord[]>('/flashcards');
}

export async function createFlashcard(
  input: CreateFlashcardInput
): Promise<FlashcardRecord> {
  return apiPost<FlashcardRecord>('/flashcards', input);
}

export async function updateFlashcard(
  id: string,
  input: Partial<Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>>
): Promise<FlashcardRecord> {
  return apiPut<FlashcardRecord>(`/flashcards/${encodeURIComponent(id)}`, input);
}

export async function deleteFlashcard(id: string): Promise<void> {
  await apiDelete(`/flashcards/${encodeURIComponent(id)}`);
}
