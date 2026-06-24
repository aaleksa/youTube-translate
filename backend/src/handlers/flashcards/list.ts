import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import { parsePaginationParams } from '../../../../v2-core/validation/pagination';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const queryString = event.rawQueryString ?? '';
  const pagination = parsePaginationParams(new URLSearchParams(queryString));
  const cards = await flashcardService.listFlashcards(auth, pagination);
  return ok(cards);
});
