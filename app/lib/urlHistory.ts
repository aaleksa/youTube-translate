const STORAGE_KEY = 'yoytube-translaty-url-history';
const MAX_ITEMS = 10;

export interface UrlHistoryItem {
  url: string;
  videoId: string;
  openedAt: number;
}

export function getUrlHistory(): UrlHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UrlHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUrlHistory(items: UrlHistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToUrlHistory(url: string, videoId: string): UrlHistoryItem[] {
  const trimmedUrl = url.trim();
  if (!trimmedUrl || !videoId) return getUrlHistory();

  const existing = getUrlHistory().filter(
    (item) => item.videoId !== videoId && item.url !== trimmedUrl
  );

  const updated: UrlHistoryItem[] = [
    { url: trimmedUrl, videoId, openedAt: Date.now() },
    ...existing,
  ].slice(0, MAX_ITEMS);

  saveUrlHistory(updated);
  return updated;
}

export function removeFromUrlHistory(url: string): UrlHistoryItem[] {
  const updated = getUrlHistory().filter((item) => item.url !== url);
  saveUrlHistory(updated);
  return updated;
}

export function clearUrlHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatHistoryDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
