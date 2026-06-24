import type {
  CreateFlashcardInput,
  FlashcardListParams,
  FlashcardRecord,
  PaginatedFlashcards,
} from '../../../v2-core/types';
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';

function buildQuery(params?: FlashcardListParams): string {
  if (!params) return '';

  const search = new URLSearchParams();
  if (params.limit !== undefined) {
    search.set('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    search.set('offset', String(params.offset));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function listFlashcards(
  params?: FlashcardListParams
): Promise<PaginatedFlashcards> {
  return apiGet<PaginatedFlashcards>(`/flashcards${buildQuery(params)}`);
}

export async function listAllFlashcards(): Promise<FlashcardRecord[]> {
  const items: FlashcardRecord[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const page = await listFlashcards({ limit, offset });
    items.push(...page.items);
    if (!page.hasMore) break;
    offset += limit;
  }

  return items;
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
