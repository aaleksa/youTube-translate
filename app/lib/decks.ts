import type { Flashcard } from './flashcards';
import {
  getDueFlashcards,
  removeDeckFromCards,
} from './flashcards';
import { scopedStorageKeyForUser, userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-decks';

function queueDeckCreate(deck: Deck): void {
  void import('./v2/syncDecks').then((mod) => mod.syncDeckCreate(deck));
}

function queueDeckDelete(deckId: string): void {
  void import('./v2/syncDecks').then((mod) => mod.syncDeckDelete(deckId));
}

export interface Deck {
  id: string;
  name: string;
  createdAt: number;
}

export interface DeckSummary {
  deck: Deck;
  cardsCount: number;
  dueCount: number;
}

function decksStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

function readDecksFromKey(storageKey: string): Deck[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Deck>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((deck) => deck.id && deck.name)
      .map((deck) => ({
        id: deck.id!,
        name: deck.name!.trim(),
        createdAt: deck.createdAt ?? Date.now(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function getDecksForUser(userId: string): Deck[] {
  return readDecksFromKey(scopedStorageKeyForUser(STORAGE_BASE_KEY, userId));
}

export function saveDecksForUser(userId: string, decks: Deck[]): void {
  localStorage.setItem(
    scopedStorageKeyForUser(STORAGE_BASE_KEY, userId),
    JSON.stringify(decks)
  );
}

export function pruneDecksForUser(userId: string, cards: Flashcard[]): void {
  const referencedDeckIds = new Set(
    cards.flatMap((card) => card.deckIds ?? [])
  );
  const decks = getDecksForUser(userId).filter((deck) =>
    referencedDeckIds.has(deck.id)
  );
  saveDecksForUser(userId, decks);
}

export function getDecks(): Deck[] {
  return readDecksFromKey(decksStorageKey());
}

function saveDecks(decks: Deck[]): void {
  localStorage.setItem(decksStorageKey(), JSON.stringify(decks));
}

export function createDeck(name: string): Deck | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const deck: Deck = {
    id: `deck_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: trimmed,
    createdAt: Date.now(),
  };

  saveDecks([deck, ...getDecks()]);
  queueDeckCreate(deck);
  return deck;
}

export function deleteDeck(deckId: string): void {
  saveDecks(getDecks().filter((deck) => deck.id !== deckId));
  removeDeckFromCards(deckId);
  queueDeckDelete(deckId);
}

export function getDeckById(deckId: string): Deck | undefined {
  return getDecks().find((deck) => deck.id === deckId);
}

export function restoreDecks(decks: Deck[]): void {
  saveDecks(
    decks
      .filter((deck) => deck.id && deck.name?.trim())
      .map((deck) => ({
        id: deck.id,
        name: deck.name.trim(),
        createdAt: deck.createdAt ?? Date.now(),
      }))
  );
}

export function getDeckSummaries(
  decks: Deck[],
  cards: Flashcard[]
): DeckSummary[] {
  return decks.map((deck) => {
    const deckCards = cards.filter((card) => card.deckIds.includes(deck.id));
    return {
      deck,
      cardsCount: deckCards.length,
      dueCount: getDueFlashcards(deckCards).length,
    };
  });
}
