import type { VideoNotesResult } from './videoNotes';

const STORAGE_PREFIX = 'yoytube-playlist-notes-';

export interface PlaylistNotesCacheEntry extends VideoNotesResult {
  playlistId: string;
  textLength: number;
  savedAt: number;
}

export function getPlaylistNotesCache(
  playlistId: string,
  textLength: number
): VideoNotesResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${playlistId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as PlaylistNotesCacheEntry;
    if (entry.textLength !== textLength) {
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
  result: VideoNotesResult
): void {
  const entry: PlaylistNotesCacheEntry = {
    playlistId,
    textLength,
    title: result.title,
    mainIdeas: result.mainIdeas,
    sections: result.sections,
    savedAt: Date.now(),
  };

  localStorage.setItem(
    `${STORAGE_PREFIX}${playlistId}`,
    JSON.stringify(entry)
  );
}
