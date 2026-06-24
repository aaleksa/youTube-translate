import type { FlashcardRecord } from '../../../../v2-core/types';
import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import {
  createProtectedHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const cardId = event.pathParameters?.id;
  if (!cardId) {
    return ok({ success: false, error: 'Missing card id' }, 400);
  }

  const body = (await readBody(event)) as Partial<
    Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>
  >;
  const card = await flashcardService.updateFlashcard(auth, cardId, body);
  return ok(card);
});
