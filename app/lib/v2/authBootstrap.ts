import { bootstrapBookmarksSync } from './syncBookmarks';
import { bootstrapFlashcardsSync } from './syncFlashcards';
import { bootstrapVideoHistorySync } from './syncVideoHistory';
import { prepareUserSession } from './userSession';

export async function bootstrapUserData(userId: string): Promise<boolean> {
  const switched = await prepareUserSession(userId);
  await Promise.all([
    bootstrapFlashcardsSync(),
    bootstrapBookmarksSync(),
    bootstrapVideoHistorySync(),
  ]);
  return switched;
}
