import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../errors';
import type {
  AuthenticatedContext,
  CreateDeckInput,
  DeckRecord,
} from '../types';
import {
  normalizeDeckId,
  validateCreateDeckInput,
} from '../validation/deck-input';
import { deckSk, userPk } from '../dynamodb/keys';
import {
  deleteItem,
  getItem,
  putItem,
  queryByUser,
  type DynamoItem,
} from '../dynamodb/repository';

interface DeckItem extends DynamoItem {
  entityType: 'DECK';
  id: string;
  name: string;
}

function toRecord(item: DeckItem): DeckRecord {
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listDecks(
  auth: AuthenticatedContext
): Promise<DeckRecord[]> {
  const items = await queryByUser<DeckItem>(auth.userId, 'DECK#');
  return items
    .map(toRecord)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function createDeck(
  auth: AuthenticatedContext,
  input: CreateDeckInput
): Promise<DeckRecord> {
  const validated = validateCreateDeckInput(input);
  const existing = await queryByUser<DeckItem>(auth.userId, 'DECK#');
  const duplicate = existing.find(
    (deck) => deck.name.toLowerCase() === validated.name.toLowerCase()
  );

  if (duplicate) {
    return toRecord(duplicate);
  }

  const now = Date.now();
  const id = randomUUID();
  const item: DeckItem = {
    PK: userPk(auth.userId),
    SK: deckSk(id),
    entityType: 'DECK',
    userId: auth.userId,
    id,
    name: validated.name,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}

export async function deleteDeck(
  auth: AuthenticatedContext,
  deckId: string
): Promise<{ success: true }> {
  const normalizedId = normalizeDeckId(deckId);
  const pk = userPk(auth.userId);
  const sk = deckSk(normalizedId);
  const existing = await getItem<DeckItem>(pk, sk);

  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Deck not found');
  }

  await deleteItem(pk, sk);
  return { success: true };
}
