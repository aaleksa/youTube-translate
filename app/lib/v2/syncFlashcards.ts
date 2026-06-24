import type { FlashcardRecord } from '../../../v2-core/types';
import { notifyFlashcardsChanged } from '../dataRefresh';
import type { Flashcard } from '../flashcards';
import { normalizeFlashcardWord } from '../flashcards';
import { isBackendV2Enabled } from './config';
import * as flashcardsApi from './flashcardsApi';
import { recordSyncConflict } from './syncConflicts';
import { getAccessToken } from './tokenStorage';
import { setPendingFlashcardSyncCount, withPendingSync } from './syncStatus';

const SERVER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYNC_DEBOUNCE_MS = 2000;

const pendingUpdates = new Map<string, ReturnType<typeof setTimeout>>();
let bootstrapPromise: Promise<void> | null = null;

function updatePendingSyncCount(): void {
  setPendingFlashcardSyncCount(pendingUpdates.size);
}

export function resetFlashcardsSyncBootstrap(): void {
  bootstrapPromise = null;
}

export function cancelPendingFlashcardSyncs(): void {
  for (const timer of pendingUpdates.values()) {
    clearTimeout(timer);
  }
  pendingUpdates.clear();
  updatePendingSyncCount();
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

export function isServerSyncedFlashcardId(id: string): boolean {
  return SERVER_ID_PATTERN.test(id);
}

function toV2Payload(
  card: Flashcard
): Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    word: card.word,
    translation: card.translation,
    example: card.example,
    tags: card.tags,
    videoId: card.videoId,
    deckIds: card.deckIds,
    repetitions: card.repetitions,
    ease: card.ease,
    interval: card.interval,
    nextReview: card.nextReview,
    knownCount: card.knownCount,
    unknownCount: card.unknownCount,
    againCount: card.againCount,
    hardCount: card.hardCount,
    goodCount: card.goodCount,
    easyCount: card.easyCount,
  };
}

function mergeDeckIds(
  serverDeckIds?: string[],
  localDeckIds?: string[]
): string[] {
  return [...new Set([...(localDeckIds ?? []), ...(serverDeckIds ?? [])])];
}

function mergeServerWithLocal(
  server: FlashcardRecord,
  local?: Flashcard
): Flashcard {
  const base: Flashcard = local ?? {
    id: server.id,
    word: server.word,
    translation: server.translation,
    example: server.example ?? '',
    tags: server.tags ?? [],
    videoId: server.videoId,
    deckIds: server.deckIds ?? [],
    createdAt: server.createdAt,
    knownCount: server.knownCount ?? 0,
    unknownCount: server.unknownCount ?? 0,
    againCount: server.againCount ?? 0,
    hardCount: server.hardCount ?? 0,
    goodCount: server.goodCount ?? 0,
    easyCount: server.easyCount ?? 0,
    quizCorrectCount: 0,
    quizWrongCount: 0,
    repetitions: server.repetitions ?? 0,
    ease: server.ease ?? 2.5,
    interval: server.interval ?? 0,
    nextReview: server.nextReview,
  };

  return {
    ...base,
    id: server.id,
    word: server.word,
    translation: server.translation,
    example: server.example ?? base.example,
    tags: server.tags ?? base.tags,
    videoId: server.videoId ?? base.videoId,
    deckIds: mergeDeckIds(server.deckIds, base.deckIds),
    repetitions: server.repetitions ?? base.repetitions,
    ease: server.ease ?? base.ease,
    interval: server.interval ?? base.interval,
    nextReview: server.nextReview ?? base.nextReview,
    knownCount: Math.max(server.knownCount ?? 0, base.knownCount ?? 0),
    unknownCount: Math.max(server.unknownCount ?? 0, base.unknownCount ?? 0),
    againCount: Math.max(server.againCount ?? 0, base.againCount ?? 0),
    hardCount: Math.max(server.hardCount ?? 0, base.hardCount ?? 0),
    goodCount: Math.max(server.goodCount ?? 0, base.goodCount ?? 0),
    easyCount: Math.max(server.easyCount ?? 0, base.easyCount ?? 0),
    createdAt: server.createdAt,
    updatedAt: server.updatedAt ?? base.updatedAt,
  };
}

function localMatchKey(card: Pick<Flashcard, 'word' | 'videoId'>): string {
  return `${normalizeFlashcardWord(card.word)}|${card.videoId ?? ''}`;
}

function detectFlashcardConflict(
  server: FlashcardRecord,
  local: Flashcard
): boolean {
  return (
    local.translation.trim() !== server.translation.trim() ||
    (local.repetitions ?? 0) !== (server.repetitions ?? 0) ||
    (local.interval ?? 0) !== (server.interval ?? 0) ||
    (local.nextReview ?? 0) !== (server.nextReview ?? 0)
  );
}

async function replaceLocalCardId(
  oldId: string,
  server: FlashcardRecord,
  local: Flashcard
): Promise<void> {
  const { getFlashcards, saveFlashcards } = await import('../flashcards');
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === oldId);
  if (index < 0) return;

  cards[index] = mergeServerWithLocal(server, local);
  saveFlashcards(cards);
  notifyFlashcardsChanged();
}

async function syncFlashcardCreateInternal(card: Flashcard): Promise<void> {
  const created = await flashcardsApi.createFlashcard(toV2Payload(card));
  if (created.id !== card.id) {
    await replaceLocalCardId(card.id, created, card);
  }
}

export async function syncFlashcardCreate(card: Flashcard): Promise<void> {
  if (!canSync()) return;

  await withPendingSync(async () => {
    try {
      await syncFlashcardCreateInternal(card);
    } catch (error) {
      console.warn('[flashcards] Failed to create on server:', error);
    }
  });
}

export async function syncFlashcardUpdate(card: Flashcard): Promise<void> {
  if (!canSync()) return;

  await withPendingSync(async () => {
    try {
      if (isServerSyncedFlashcardId(card.id)) {
        await flashcardsApi.updateFlashcard(card.id, toV2Payload(card));
        return;
      }

      await syncFlashcardCreateInternal(card);
    } catch (error) {
      console.warn('[flashcards] Failed to update on server:', error);
      if (isServerSyncedFlashcardId(card.id)) {
        try {
          await syncFlashcardCreateInternal(card);
        } catch (retryError) {
          console.warn('[flashcards] Failed to recreate on server:', retryError);
        }
      }
    }
  });
}

export function scheduleFlashcardSync(card: Flashcard): void {
  if (!canSync()) return;

  const existing = pendingUpdates.get(card.id);
  if (existing) clearTimeout(existing);

  pendingUpdates.set(
    card.id,
    setTimeout(() => {
      pendingUpdates.delete(card.id);
      updatePendingSyncCount();
      void syncFlashcardUpdate(card);
    }, SYNC_DEBOUNCE_MS)
  );
  updatePendingSyncCount();
}

export async function syncFlashcardDelete(id: string): Promise<void> {
  if (!canSync() || !isServerSyncedFlashcardId(id)) return;

  await withPendingSync(async () => {
    try {
      await flashcardsApi.deleteFlashcard(id);
    } catch (error) {
      console.warn('[flashcards] Failed to delete on server:', error);
    }
  });
}

export async function bootstrapFlashcardsSync(userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const { getFlashcardsForUser, saveFlashcardsForUser } = await import(
      '../flashcards'
    );

    let serverCards: FlashcardRecord[] = [];
    try {
      serverCards = await flashcardsApi.listAllFlashcards();
    } catch (error) {
      console.warn('[flashcards] Failed to load from server:', error);
      return;
    }

    const localCards = getFlashcardsForUser(userId);
    const localById = new Map(localCards.map((card) => [card.id, card]));
    const localByKey = new Map(
      localCards.map((card) => [localMatchKey(card), card])
    );
    const processedLocalIds = new Set<string>();
    const merged: Flashcard[] = [];

    for (const serverCard of serverCards) {
      const local =
        localById.get(serverCard.id) ??
        localByKey.get(
          localMatchKey({
            word: serverCard.word,
            videoId: serverCard.videoId,
          })
        );

      const mergedCard = mergeServerWithLocal(serverCard, local);
      merged.push(mergedCard);

      if (local && detectFlashcardConflict(serverCard, local)) {
        recordSyncConflict({
          id: serverCard.id,
          entityType: 'flashcard',
          label: serverCard.word,
          strategy: 'merged',
        });
      }

      if (local) {
        processedLocalIds.add(local.id);
        const serverDeckIds = serverCard.deckIds ?? [];
        const localDeckIds = local.deckIds ?? [];
        if (
          localDeckIds.length > serverDeckIds.length ||
          localDeckIds.some((id) => !serverDeckIds.includes(id))
        ) {
          scheduleFlashcardSync(mergedCard);
        }
      }
    }

    for (const localCard of localCards) {
      if (processedLocalIds.has(localCard.id)) continue;
      if (serverCards.length === 0) continue;

      if (isServerSyncedFlashcardId(localCard.id)) {
        continue;
      }

      try {
        const created = await flashcardsApi.createFlashcard(toV2Payload(localCard));
        merged.push(mergeServerWithLocal(created, localCard));
      } catch (error) {
        console.warn('[flashcards] Failed to upload local card:', error);
        merged.push(localCard);
      }
    }

    saveFlashcardsForUser(userId, merged);

    notifyFlashcardsChanged();
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
