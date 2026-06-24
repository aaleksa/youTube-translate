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
    { resetVideoHistorySyncBootstrap },
  ] = await Promise.all([
    import('./syncFlashcards'),
    import('./syncBookmarks'),
    import('./syncVideoHistory'),
  ]);
  cancelPendingFlashcardSyncs();
  resetFlashcardsSyncBootstrap();
  resetBookmarksSyncBootstrap();
  resetVideoHistorySyncBootstrap();
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
