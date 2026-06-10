export const FLASHCARDS_CHANGED_EVENT = 'yoytube-flashcards-changed';

export function notifyFlashcardsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FLASHCARDS_CHANGED_EVENT));
}
