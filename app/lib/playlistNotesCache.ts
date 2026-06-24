import type { VideoNotesResult } from './videoNotes';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-playlist-notes-';

export interface PlaylistNotesCacheEntry extends VideoNotesResult {
  playlistId: string;
  textLength: number;
  taskLanguage: string;
  savedAt: number;
}

function cacheKey(playlistId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${playlistId}-${taskLanguage}`;
}

export function getPlaylistNotesCache(
  playlistId: string,
  textLength: number,
  taskLanguage: string
): VideoNotesResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(cacheKey(playlistId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as PlaylistNotesCacheEntry;
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

export function setPlaylistNotesCache(
  playlistId: string,
  textLength: number,
  taskLanguage: string,
  result: VideoNotesResult
): void {
  const entry: PlaylistNotesCacheEntry = {
    playlistId,
    textLength,
    taskLanguage,
    title: result.title,
    mainIdeas: result.mainIdeas,
    sections: result.sections,
    savedAt: Date.now(),
  };

  setAiCacheRaw(
    cacheKey(playlistId, taskLanguage),
    JSON.stringify(entry)
  );
}

export function clearPlaylistNotesCache(playlistId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${playlistId}`);
}
