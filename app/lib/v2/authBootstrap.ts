import { bootstrapBookmarksSync } from './syncBookmarks';
import { bootstrapFlashcardsSync } from './syncFlashcards';
import { bootstrapVideoHistorySync } from './syncVideoHistory';
import { prepareUserSession } from './userSession';
import {
  notifyBookmarksChanged,
  notifyFlashcardsChanged,
  notifyVideoHistoryChanged,
} from '../dataRefresh';

export async function bootstrapUserData(userId: string): Promise<void> {
  await prepareUserSession(userId);
  await bootstrapFlashcardsSync(userId);
  await Promise.all([
    bootstrapBookmarksSync(userId),
    bootstrapVideoHistorySync(userId),
  ]);
  notifyFlashcardsChanged();
  notifyBookmarksChanged();
  notifyVideoHistoryChanged();
}
