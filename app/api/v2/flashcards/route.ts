import type { CreateFlashcardInput } from '../../../../v2-core/types';
import { requireAuth } from '../../../../v2-core/http/request';
import { parseJsonBody } from '../../../../v2-core/http/request';
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
    const body = await parseJsonBody<CreateFlashcardInput>(request);
    return flashcardService.createFlashcard(auth, body);
  }, 201);
}
