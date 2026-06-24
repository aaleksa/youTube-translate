import { bootstrapBookmarksSync } from './syncBookmarks';
import { bootstrapDecksSync } from './syncDecks';
import { bootstrapFlashcardsSync } from './syncFlashcards';
import { bootstrapQuizResultsSync } from './syncQuizResults';
import { bootstrapUserSettingsSync } from './syncUserSettings';
import { bootstrapVideoHistorySync } from './syncVideoHistory';
import { setBootstrapSyncActive } from './syncStatus';
import { prepareUserSession } from './userSession';
import {
  notifyBookmarksChanged,
  notifyFlashcardsChanged,
  notifyVideoHistoryChanged,
} from '../dataRefresh';

export async function bootstrapUserData(userId: string): Promise<void> {
  setBootstrapSyncActive(true);
  try {
    await prepareUserSession(userId);
    await bootstrapFlashcardsSync(userId);
    await Promise.all([
      bootstrapBookmarksSync(userId),
      bootstrapDecksSync(userId),
      bootstrapVideoHistorySync(userId),
      bootstrapUserSettingsSync(userId),
      bootstrapQuizResultsSync(userId),
    ]);
    notifyFlashcardsChanged();
    notifyBookmarksChanged();
    notifyVideoHistoryChanged();
  } finally {
    setBootstrapSyncActive(false);
  }
}
