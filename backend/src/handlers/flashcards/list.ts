import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const cards = await flashcardService.listFlashcards(auth);
  return ok(cards);
});
