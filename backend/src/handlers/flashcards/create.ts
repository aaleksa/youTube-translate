import type { FlashcardRecord } from '../../../../v2-core/types';
import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import {
  createProtectedHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const body = (await readBody(event)) as Omit<
    FlashcardRecord,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  >;
  const card = await flashcardService.createFlashcard(auth, body);
  return ok(card, 201);
});
