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

const STORAGE_KEY = 'yoytube-transcript-history';
const MAX_ITEMS = 10;
const SNIPPET_RADIUS = 60;

export function getTranscriptHistory(): TranscriptHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

function saveTranscriptHistory(entries: TranscriptHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

export function clearTranscriptHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
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

export function searchTranscriptHistory(query: string): TranscriptSearchResult[] {
  const entries = getTranscriptHistory();
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
