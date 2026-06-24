export interface TranscriptHistoryItem {
  text: string;
  start?: string;
  duration?: string;
}

export interface TranscriptHistoryEntry {
  videoId: string;
  url: string;
  title: string;
  text: string;
  transcript: TranscriptHistoryItem[];
  savedAt: number;
}

export interface TranscriptSearchResult {
  entry: TranscriptHistoryEntry;
  matchedIn: Array<'title' | 'text'>;
  snippet?: string;
}

import { scopedStorageKeyForUser, userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-transcript-history';
export const TRANSCRIPT_HISTORY_MAX_ITEMS = 50;
const MAX_ITEMS = TRANSCRIPT_HISTORY_MAX_ITEMS;
const SNIPPET_RADIUS = 60;

function transcriptHistoryStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

function readTranscriptHistoryFromKey(storageKey: string): TranscriptHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as TranscriptHistoryEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry) =>
        entry.videoId &&
        entry.url &&
        typeof entry.text === 'string' &&
        Array.isArray(entry.transcript)
    );
  } catch {
    return [];
  }
}

export function mergeTranscriptHistoryEntries(
  ...groups: TranscriptHistoryEntry[][]
): TranscriptHistoryEntry[] {
  const byVideoId = new Map<string, TranscriptHistoryEntry>();

  for (const entries of groups) {
    for (const entry of entries) {
      if (!entry.videoId || !entry.url) continue;

      const existing = byVideoId.get(entry.videoId);
      if (!existing) {
        byVideoId.set(entry.videoId, entry);
        continue;
      }

      byVideoId.set(entry.videoId, {
        ...existing,
        title: entry.title || existing.title,
        url: entry.url || existing.url,
        text: entry.text || existing.text,
        transcript:
          entry.transcript.length > 0 ? entry.transcript : existing.transcript,
        savedAt: Math.max(existing.savedAt, entry.savedAt),
      });
    }
  }

  return [...byVideoId.values()].sort((left, right) => right.savedAt - left.savedAt);
}

export function getTranscriptHistoryForUser(userId: string): TranscriptHistoryEntry[] {
  return readTranscriptHistoryFromKey(
    scopedStorageKeyForUser(STORAGE_BASE_KEY, userId)
  );
}

export function replaceTranscriptHistoryForUser(
  userId: string,
  entries: TranscriptHistoryEntry[]
): void {
  const valid = entries
    .filter(
      (entry) =>
        entry.videoId &&
        entry.url &&
        typeof entry.text === 'string' &&
        Array.isArray(entry.transcript)
    )
    .sort((left, right) => right.savedAt - left.savedAt)
    .slice(0, MAX_ITEMS);

  localStorage.setItem(
    scopedStorageKeyForUser(STORAGE_BASE_KEY, userId),
    JSON.stringify(valid)
  );
}

export function getTranscriptHistory(): TranscriptHistoryEntry[] {
  return readTranscriptHistoryFromKey(transcriptHistoryStorageKey());
}

function saveTranscriptHistory(entries: TranscriptHistoryEntry[]): void {
  localStorage.setItem(transcriptHistoryStorageKey(), JSON.stringify(entries));
}

export function saveToTranscriptHistory(
  entry: Omit<TranscriptHistoryEntry, 'savedAt'>
): TranscriptHistoryEntry[] {
  const trimmedUrl = entry.url.trim();
  if (!trimmedUrl || !entry.videoId || !entry.text.trim()) {
    return getTranscriptHistory();
  }

  const nextEntry: TranscriptHistoryEntry = {
    videoId: entry.videoId,
    url: trimmedUrl,
    title: entry.title.trim() || entry.videoId,
    text: entry.text,
    transcript: entry.transcript,
    savedAt: Date.now(),
  };

  const existing = getTranscriptHistory().filter(
    (item) => item.videoId !== entry.videoId
  );

  const updated = [nextEntry, ...existing].slice(0, MAX_ITEMS);
  saveTranscriptHistory(updated);
  return updated;
}

export function removeFromTranscriptHistory(videoId: string): TranscriptHistoryEntry[] {
  const updated = getTranscriptHistory().filter((item) => item.videoId !== videoId);
  saveTranscriptHistory(updated);
  return updated;
}

export function replaceTranscriptHistory(entries: TranscriptHistoryEntry[]): void {
  const valid = entries
    .filter(
      (entry) =>
        entry.videoId &&
        entry.url &&
        typeof entry.text === 'string' &&
        Array.isArray(entry.transcript)
    )
    .sort((left, right) => right.savedAt - left.savedAt)
    .slice(0, MAX_ITEMS);

  saveTranscriptHistory(valid);
}

export function clearTranscriptHistory(): void {
  localStorage.removeItem(transcriptHistoryStorageKey());
}

function buildTextSnippet(text: string, query: string): string {
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query);
  if (index === -1) return '';

  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + query.length + SNIPPET_RADIUS);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';

  return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
}

export function searchTranscriptHistory(
  query: string,
  sourceEntries?: TranscriptHistoryEntry[]
): TranscriptSearchResult[] {
  const entries = sourceEntries ?? getTranscriptHistory();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return entries.map((entry) => ({ entry, matchedIn: [] }));
  }

  const results: TranscriptSearchResult[] = [];

  for (const entry of entries) {
    const matchedIn: Array<'title' | 'text'> = [];
    const titleMatch = entry.title.toLowerCase().includes(normalizedQuery);
    const textMatch = entry.text.toLowerCase().includes(normalizedQuery);

    if (titleMatch) matchedIn.push('title');
    if (textMatch) matchedIn.push('text');
    if (matchedIn.length === 0) continue;

    results.push({
      entry,
      matchedIn,
      snippet: textMatch
        ? buildTextSnippet(entry.text, normalizedQuery)
        : undefined,
    });
  }

  return results;
}

export function formatHistoryDate(
  timestamp: number,
  locale?: string
): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
