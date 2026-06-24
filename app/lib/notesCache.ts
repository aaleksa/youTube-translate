import type { VideoNotesResult } from './videoNotes';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

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
    const raw = getAiCacheRaw(cacheKey(videoId, taskLanguage));
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

  setAiCacheRaw(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearNotesCache(videoId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
