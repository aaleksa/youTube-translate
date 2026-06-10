import type { VideoNotesResult } from './videoNotes';

const STORAGE_PREFIX = 'yoytube-notes-';

export interface NotesCacheEntry extends VideoNotesResult {
  videoId: string;
  textLength: number;
  taskLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${taskLanguage}`;
}

export function getNotesCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoNotesResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as NotesCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.taskLanguage !== taskLanguage
    ) {
      return null;
    }

    if (
      !Array.isArray(entry.mainIdeas) ||
      !Array.isArray(entry.sections) ||
      (entry.mainIdeas.length === 0 && entry.sections.length === 0)
    ) {
      return null;
    }

    return {
      title: entry.title,
      mainIdeas: entry.mainIdeas,
      sections: entry.sections,
    };
  } catch {
    return null;
  }
}

export function setNotesCache(
  videoId: string,
  textLength: number,
  taskLanguage: string,
  result: VideoNotesResult
): void {
  const entry: NotesCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    title: result.title,
    mainIdeas: result.mainIdeas,
    sections: result.sections,
    savedAt: Date.now(),
  };

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearNotesCache(videoId: string): void {
  const prefix = `${STORAGE_PREFIX}${videoId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
