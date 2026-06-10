import type { VideoNotesResult } from './videoNotes';

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
    const raw = localStorage.getItem(cacheKey(playlistId, taskLanguage));
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

  localStorage.setItem(
    cacheKey(playlistId, taskLanguage),
    JSON.stringify(entry)
  );
}

export function clearPlaylistNotesCache(playlistId: string): void {
  const prefix = `${STORAGE_PREFIX}${playlistId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
