import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const cardId = event.pathParameters?.id;
  if (!cardId) {
    return ok({ success: false, error: 'Missing card id' }, 400);
  }

  const result = await flashcardService.deleteFlashcard(auth, cardId);
  return ok(result);
});
