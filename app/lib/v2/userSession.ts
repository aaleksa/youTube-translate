import {
  notifyBookmarksChanged,
  notifyFlashcardsChanged,
  notifyVideoHistoryChanged,
} from '../dataRefresh';
import {
  clearLegacyGlobalUserData,
  clearUserScopedLocalData,
  migrateLegacyUserDataToScoped,
} from './userStorage';

const LAST_USER_ID_KEY = 'yoytube-v2-last-user-id';

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

export function getLastUserId(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(LAST_USER_ID_KEY);
}

export async function resetSyncBootstrapState(): Promise<void> {
  const [
    { resetFlashcardsSyncBootstrap, cancelPendingFlashcardSyncs },
    { resetBookmarksSyncBootstrap },
    { resetDecksSyncBootstrap },
    { resetVideoHistorySyncBootstrap },
    { resetUserSettingsSyncBootstrap, cancelPendingUserSettingsSync },
    { resetQuizResultsSyncBootstrap },
    { resetDailyStudySyncBootstrap, cancelPendingDailyStudySync },
    { resetPronunciationAttemptsSyncBootstrap },
    {
      resetPlaybackPositionSyncBootstrap,
      resetPlaybackPositionSyncState,
    },
    { resetSyncConflicts },
  ] = await Promise.all([
    import('./syncFlashcards'),
    import('./syncBookmarks'),
    import('./syncDecks'),
    import('./syncVideoHistory'),
    import('./syncUserSettings'),
    import('./syncQuizResults'),
    import('./syncDailyStudyLog'),
    import('./syncPronunciationAttempts'),
    import('./syncPlaybackPosition'),
    import('./syncConflicts'),
  ]);
  cancelPendingFlashcardSyncs();
  cancelPendingUserSettingsSync();
  cancelPendingDailyStudySync();
  resetFlashcardsSyncBootstrap();
  resetBookmarksSyncBootstrap();
  resetDecksSyncBootstrap();
  resetVideoHistorySyncBootstrap();
  resetUserSettingsSyncBootstrap();
  resetQuizResultsSyncBootstrap();
  resetDailyStudySyncBootstrap();
  resetPronunciationAttemptsSyncBootstrap();
  resetPlaybackPositionSyncBootstrap();
  resetPlaybackPositionSyncState();
  resetSyncConflicts();
}

export async function prepareUserSession(userId: string): Promise<void> {
  const previousUserId = getLastUserId();
  const accountSwitched =
    previousUserId !== null && previousUserId !== userId;
  const firstSessionOnBrowser = previousUserId === null;

  if (accountSwitched) {
    clearUserScopedLocalData(userId);
  } else if (firstSessionOnBrowser) {
    migrateLegacyUserDataToScoped(userId, { firstSessionOnBrowser: true });
  }

  clearLegacyGlobalUserData();
  await resetSyncBootstrapState();

  if (canUseStorage()) {
    localStorage.setItem(LAST_USER_ID_KEY, userId);
  }
}

export async function clearUserSession(): Promise<void> {
  clearLegacyGlobalUserData();
  clearUserScopedLocalData('__anonymous__');
  await resetSyncBootstrapState();

  notifyFlashcardsChanged();
  notifyBookmarksChanged();
  notifyVideoHistoryChanged();
}
