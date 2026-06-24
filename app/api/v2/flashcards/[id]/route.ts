import type { FlashcardRecord } from '../../../../../v2-core/types';
import { requireAuth } from '../../../../../v2-core/http/request';
import * as flashcardService from '../../../../../v2-core/services/flashcard-service';
import { handleRoute } from '../../_lib/route';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = (await request.json()) as Partial<
      Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>
    >;
    return flashcardService.updateFlashcard(auth, id, body);
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return flashcardService.deleteFlashcard(auth, id);
  });
}
