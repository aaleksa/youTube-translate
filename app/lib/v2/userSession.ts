import {
  notifyBookmarksChanged,
  notifyFlashcardsChanged,
} from '../dataRefresh';
import { clearLegacyGlobalUserData } from './userStorage';

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

export async function prepareUserSession(userId: string): Promise<boolean> {
  const previousUserId = getLastUserId();
  const switched = previousUserId !== null && previousUserId !== userId;

  clearLegacyGlobalUserData();
  await resetSyncBootstrapState();

  if (canUseStorage()) {
    localStorage.setItem(LAST_USER_ID_KEY, userId);
  }

  notifyFlashcardsChanged();
  notifyBookmarksChanged();

  return switched;
}

export async function clearUserSession(): Promise<void> {
  clearLegacyGlobalUserData();
  await resetSyncBootstrapState();

  if (canUseStorage()) {
    localStorage.removeItem(LAST_USER_ID_KEY);
  }

  notifyFlashcardsChanged();
  notifyBookmarksChanged();
}
