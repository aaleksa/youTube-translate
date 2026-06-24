import type { DeckRecord } from '../../../v2-core/types';
import type { Deck } from '../decks';
import { notifyFlashcardsChanged } from '../dataRefresh';
import { isBackendV2Enabled } from './config';
import * as decksApi from './decksApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

const SERVER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let bootstrapPromise: Promise<void> | null = null;

export function resetDecksSyncBootstrap(): void {
  bootstrapPromise = null;
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

export function isServerSyncedDeckId(id: string): boolean {
  return SERVER_ID_PATTERN.test(id);
}

function toLocalDeck(server: DeckRecord, local?: Deck): Deck {
  return {
    id: server.id,
    name: server.name,
    createdAt: server.createdAt ?? local?.createdAt ?? Date.now(),
  };
}

function localMatchKey(deck: Pick<Deck, 'name'>): string {
  return deck.name.trim().toLowerCase();
}

async function remapDeckIdInFlashcards(
  userId: string,
  oldId: string,
  newId: string
): Promise<void> {
  const { getFlashcardsForUser, saveFlashcardsForUser } = await import(
    '../flashcards'
  );
  const cards = getFlashcardsForUser(userId);
  let changed = false;

  for (const card of cards) {
    if (!card.deckIds?.includes(oldId)) continue;
    card.deckIds = card.deckIds.map((deckId) =>
      deckId === oldId ? newId : deckId
    );
    changed = true;
  }

  if (changed) {
    saveFlashcardsForUser(userId, cards);
  }
}

async function replaceLocalDeckId(
  userId: string,
  oldId: string,
  server: DeckRecord,
  local: Deck
): Promise<void> {
  const { getDecksForUser, saveDecksForUser } = await import('../decks');
  const decks = getDecksForUser(userId);
  const index = decks.findIndex((deck) => deck.id === oldId);
  if (index < 0) return;

  decks[index] = toLocalDeck(server, local);
  saveDecksForUser(userId, decks);
  await remapDeckIdInFlashcards(userId, oldId, server.id);
  notifyFlashcardsChanged();
}

export async function syncDeckCreate(deck: Deck): Promise<void> {
  if (!canSync()) return;

  await withPendingSync(async () => {
    try {
      const created = await decksApi.createDeck({ name: deck.name });
      const userId = (await import('./tokenStorage')).getStoredUser()?.userId;
      if (!userId || created.id === deck.id) return;
      await replaceLocalDeckId(userId, deck.id, created, deck);
      notifyFlashcardsChanged();
    } catch (error) {
      console.warn('[decks] Failed to create on server:', error);
    }
  });
}

export async function syncDeckDelete(deckId: string): Promise<void> {
  if (!canSync() || !isServerSyncedDeckId(deckId)) return;

  await withPendingSync(async () => {
    try {
      await decksApi.deleteDeck(deckId);
    } catch (error) {
      console.warn('[decks] Failed to delete on server:', error);
    }
  });
}

export async function bootstrapDecksSync(userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const { getDecksForUser, saveDecksForUser } = await import('../decks');

    let serverDecks: DeckRecord[] = [];
    try {
      serverDecks = await decksApi.listDecks();
    } catch (error) {
      console.warn('[decks] Failed to load from server:', error);
      return;
    }

    const localDecks = getDecksForUser(userId);
    const localById = new Map(localDecks.map((deck) => [deck.id, deck]));
    const localByName = new Map(
      localDecks.map((deck) => [localMatchKey(deck), deck])
    );
    const processedLocalIds = new Set<string>();
    const merged: Deck[] = [];

    for (const serverDeck of serverDecks) {
      const local =
        localById.get(serverDeck.id) ??
        localByName.get(localMatchKey({ name: serverDeck.name }));

      merged.push(toLocalDeck(serverDeck, local));
      if (local) processedLocalIds.add(local.id);
    }

    for (const localDeck of localDecks) {
      if (processedLocalIds.has(localDeck.id)) continue;
      if (serverDecks.length === 0) continue;
      if (isServerSyncedDeckId(localDeck.id)) continue;

      try {
        const created = await decksApi.createDeck({ name: localDeck.name });
        merged.push(toLocalDeck(created, localDeck));
        if (created.id !== localDeck.id) {
          await remapDeckIdInFlashcards(userId, localDeck.id, created.id);
        }
      } catch (error) {
        console.warn('[decks] Failed to upload local deck:', error);
        merged.push(localDeck);
      }
    }

    saveDecksForUser(userId, merged);
    notifyFlashcardsChanged();
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
