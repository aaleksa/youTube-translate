import type { CreateFlashcardInput } from '../../../../v2-core/types';
import { requireAuth } from '../../../../v2-core/http/request';
import { parseJsonBody } from '../../../../v2-core/http/request';
import * as flashcardService from '../../../../v2-core/services/flashcard-service';
import { parsePaginationParams } from '../../../../v2-core/validation/pagination';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const pagination = parsePaginationParams(searchParams);
    return flashcardService.listFlashcards(auth, pagination);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<CreateFlashcardInput>(request);
    return flashcardService.createFlashcard(auth, body);
  }, 201);
}
