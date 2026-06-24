import type { AuthenticatedContext, TodayReviewsResponse } from '../types';
import { buildTodayReviewQueue } from '../srs/review-queue';
import { startOfDay } from '../srs/spaced-repetition';
import { listAllFlashcards } from './flashcard-service';

export async function listTodayReviews(
  auth: AuthenticatedContext
): Promise<TodayReviewsResponse> {
  const now = Date.now();
  const cards = await listAllFlashcards(auth);
  const items = buildTodayReviewQueue(cards, now);

  return {
    date: startOfDay(new Date(now)),
    total: items.length,
    items,
  };
}
