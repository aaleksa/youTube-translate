import type { KeyVocabularyItem } from './keyVocabulary';

const STORAGE_PREFIX = 'yoytube-key-vocabulary-';

export interface KeyVocabularyCacheEntry {
  videoId: string;
  textLength: number;
  vocabulary: KeyVocabularyItem[];
  savedAt: number;
}

export function getKeyVocabularyCache(
  videoId: string,
  textLength: number
): KeyVocabularyItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as KeyVocabularyCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.vocabulary)) {
      return null;
    }

    return entry.vocabulary;
  } catch {
    return null;
  }
}

export function setKeyVocabularyCache(
  videoId: string,
  textLength: number,
  vocabulary: KeyVocabularyItem[]
): void {
  const entry: KeyVocabularyCacheEntry = {
    videoId,
    textLength,
    vocabulary,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearKeyVocabularyCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
