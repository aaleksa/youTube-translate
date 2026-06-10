import { enrichTranscriptData } from './transcriptPipeline';
import type { PhraseChunk, RawCaption, Sentence } from './transcriptTypes';
import { extractVideoId } from './youtubeUrl';

export const TRANSCRIPT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DB_NAME = 'yoytube-transcript-cache';
const STORE_NAME = 'transcripts';
const DB_VERSION = 1;
const LOCAL_STORAGE_PREFIX = 'yoytube-transcript-cache-';

export interface TranscriptCacheLine {
  text: string;
  start?: string;
  duration?: string;
}

export interface TranscriptCacheData {
  videoId: string;
  title?: string;
  channelName?: string;
  durationSeconds?: number;
  transcript: TranscriptCacheLine[];
  rawCaptions?: RawCaption[];
  displayLines?: RawCaption[];
  displayTranscript?: TranscriptCacheLine[];
  sentences?: Sentence[];
  phrases?: PhraseChunk[];
  text: string;
  selectedLanguage?: string;
  subtitleLanguageName?: string;
  subtitleLanguageKind?: 'manual' | 'auto';
}

interface TranscriptCacheRecord {
  cacheKey: string;
  videoId: string;
  url: string;
  data: TranscriptCacheData;
  savedAt: number;
  expiresAt: number;
}

export interface CachedTranscriptResult {
  data: TranscriptCacheData;
  url: string;
  savedAt: number;
  expiresAt: number;
  storage: 'indexeddb' | 'localstorage';
}

function buildCacheKey(videoId: string, subtitleLanguage?: string): string {
  const lang = subtitleLanguage?.trim() || 'default';
  return `${videoId}:${lang}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

function readFromIndexedDB(cacheKey: string): Promise<TranscriptCacheRecord | null> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(cacheKey);

        request.onsuccess = () => {
          resolve((request.result as TranscriptCacheRecord | undefined) ?? null);
        };
        request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => db.close();
      })
  );
}

function writeToIndexedDB(record: TranscriptCacheRecord): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('IndexedDB write failed'));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => db.close();
      })
  );
}

function deleteFromIndexedDB(cacheKey: string): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(cacheKey);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('IndexedDB delete failed'));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => db.close();
      })
  );
}

function readFromLocalStorage(cacheKey: string): TranscriptCacheRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as TranscriptCacheRecord;
  } catch {
    return null;
  }
}

function writeToLocalStorage(record: TranscriptCacheRecord): void {
  localStorage.setItem(
    `${LOCAL_STORAGE_PREFIX}${record.cacheKey}`,
    JSON.stringify(record)
  );
}

function deleteFromLocalStorage(cacheKey: string): void {
  localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${cacheKey}`);
}

function isExpired(record: TranscriptCacheRecord): boolean {
  return Date.now() > record.expiresAt;
}

function toCachedResult(
  record: TranscriptCacheRecord,
  storage: CachedTranscriptResult['storage']
): CachedTranscriptResult {
  return {
    data: enrichTranscriptData(record.data),
    url: record.url,
    savedAt: record.savedAt,
    expiresAt: record.expiresAt,
    storage,
  };
}

async function removeCachedRecord(
  cacheKey: string,
  storage: CachedTranscriptResult['storage']
): Promise<void> {
  if (storage === 'indexeddb') {
    try {
      await deleteFromIndexedDB(cacheKey);
    } catch {
      // ignore cleanup errors
    }
  } else {
    deleteFromLocalStorage(cacheKey);
  }
}

export async function getCachedTranscript(
  videoId: string,
  subtitleLanguage?: string
): Promise<CachedTranscriptResult | null> {
  const cacheKey = buildCacheKey(videoId, subtitleLanguage);

  try {
    const indexedRecord = await readFromIndexedDB(cacheKey);
    if (indexedRecord) {
      if (isExpired(indexedRecord)) {
        await removeCachedRecord(cacheKey, 'indexeddb');
      } else {
        return toCachedResult(indexedRecord, 'indexeddb');
      }
    }
  } catch {
    // fall through to localStorage
  }

  const localRecord = readFromLocalStorage(cacheKey);
  if (!localRecord) return null;

  if (isExpired(localRecord)) {
    deleteFromLocalStorage(cacheKey);
    return null;
  }

  return toCachedResult(localRecord, 'localstorage');
}

export async function getCachedTranscriptByUrl(
  url: string,
  subtitleLanguage?: string
): Promise<CachedTranscriptResult | null> {
  const videoId = extractVideoId(url.trim());
  if (!videoId) return null;
  return getCachedTranscript(videoId, subtitleLanguage);
}

export async function setCachedTranscript(
  url: string,
  data: TranscriptCacheData,
  subtitleLanguage?: string
): Promise<void> {
  const trimmedUrl = url.trim();
  const videoId = data.videoId || extractVideoId(trimmedUrl);
  if (!videoId || !data.text.trim() || !Array.isArray(data.transcript)) {
    return;
  }

  const cacheKey = buildCacheKey(videoId, subtitleLanguage ?? data.selectedLanguage);
  const savedAt = Date.now();
  const record: TranscriptCacheRecord = {
    cacheKey,
    videoId,
    url: trimmedUrl,
    data: enrichTranscriptData({ ...data, videoId }),
    savedAt,
    expiresAt: savedAt + TRANSCRIPT_CACHE_TTL_MS,
  };

  try {
    await writeToIndexedDB(record);
    deleteFromLocalStorage(cacheKey);
    return;
  } catch {
    writeToLocalStorage(record);
  }
}

export async function clearCachedTranscript(
  videoId: string,
  subtitleLanguage?: string
): Promise<void> {
  const cacheKey = buildCacheKey(videoId, subtitleLanguage);
  await removeCachedRecord(cacheKey, 'indexeddb');
  deleteFromLocalStorage(cacheKey);
}
