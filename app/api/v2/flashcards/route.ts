import type { FlashcardRecord } from '../../../../v2-core/types';
import { requireAuth } from '../../../../v2-core/http/request';
import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return flashcardService.listFlashcards(auth);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = (await request.json()) as Omit<
      FlashcardRecord,
      'id' | 'userId' | 'createdAt' | 'updatedAt'
    >;
    return flashcardService.createFlashcard(auth, body);
  }, 201);
}
