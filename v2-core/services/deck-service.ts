import type { AuthenticatedContext, DeckRecord } from '../types';
import { deckSk } from '../dynamodb/keys';
import { queryByUser, type DynamoItem } from '../dynamodb/repository';

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
  return items.map(toRecord);
}
