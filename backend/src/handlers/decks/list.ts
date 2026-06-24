import * as deckService from '../../../../v2-core/services/deck-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const decks = await deckService.listDecks(auth);
  return ok(decks);
});
