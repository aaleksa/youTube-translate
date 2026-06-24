import { requireAuth } from '../../../../../v2-core/http/request';
import * as deckService from '../../../../../v2-core/services/deck-service';
import { handleRoute } from '../../_lib/route';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ deckId: string }> }
) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { deckId } = await context.params;
    return deckService.deleteDeck(auth, deckId);
  });
}
