export const FLASHCARDS_CHANGED_EVENT = 'yoytube-flashcards-changed';
export const BOOKMARKS_CHANGED_EVENT = 'yoytube-bookmarks-changed';

export function notifyFlashcardsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FLASHCARDS_CHANGED_EVENT));
}

export function notifyBookmarksChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BOOKMARKS_CHANGED_EVENT));
}
