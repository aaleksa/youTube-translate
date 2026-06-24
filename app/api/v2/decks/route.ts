import { requireAuth } from '../../../../v2-core/http/request';
import * as deckService from '../../../../v2-core/services/deck-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return deckService.listDecks(auth);
  });
}
