import type { CreateDeckInput, DeckRecord } from '../../../v2-core/types';
import { apiDelete, apiGet, apiPost } from './apiClient';

export async function listDecks(): Promise<DeckRecord[]> {
  return apiGet<DeckRecord[]>('/decks');
}

export async function createDeck(input: CreateDeckInput): Promise<DeckRecord> {
  return apiPost<DeckRecord>('/decks', input);
}

export async function deleteDeck(deckId: string): Promise<void> {
  await apiDelete(`/decks/${encodeURIComponent(deckId)}`);
}
