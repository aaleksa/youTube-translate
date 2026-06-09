import type { VideoNotesResult } from './videoNotes';

const STORAGE_PREFIX = 'yoytube-notes-';

export interface NotesCacheEntry extends VideoNotesResult {
  videoId: string;
  textLength: number;
  savedAt: number;
}

export function getNotesCache(
  videoId: string,
  textLength: number
): VideoNotesResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as NotesCacheEntry;
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

export function setNotesCache(
  videoId: string,
  textLength: number,
  result: VideoNotesResult
): void {
  const entry: NotesCacheEntry = {
    videoId,
    textLength,
    title: result.title,
    mainIdeas: result.mainIdeas,
    sections: result.sections,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearNotesCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
