'use client';

import { useEffect, useMemo, useState } from 'react';
import { getInterfaceLocale } from '../lib/i18n';
import {
  clearTranscriptHistory,
  formatHistoryDate,
  getTranscriptHistory,
  getTranscriptHistoryForUser,
  removeFromTranscriptHistory,
  searchTranscriptHistory,
  type TranscriptHistoryEntry,
  type TranscriptSearchResult,
} from '../lib/transcriptHistory';
import { deleteVideoHistory } from '../lib/v2/videoHistoryApi';
import { VIDEO_HISTORY_CHANGED_EVENT } from '../lib/dataRefresh';
import { getAccessToken } from '../lib/v2/tokenStorage';
import { isBackendV2Enabled } from '../lib/v2/config';
import { useAuth } from './auth/AuthProvider';
import { useI18n } from './InterfaceLanguageProvider';

function readHistoryEntries(userId: string | undefined): TranscriptHistoryEntry[] {
  if (isBackendV2Enabled() && userId) {
    return getTranscriptHistoryForUser(userId);
  }
  return getTranscriptHistory();
}

function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

interface TranscriptHistorySearchProps {
  isLoading: boolean;
  refreshKey?: number;
  onLoad: (entry: TranscriptHistoryEntry) => void;
}

export default function TranscriptHistorySearch({
  isLoading,
  refreshKey = 0,
  onLoad,
}: TranscriptHistorySearchProps) {
  const { user } = useAuth();
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<TranscriptHistoryEntry[]>([]);
  const locale = getInterfaceLocale(language);
  const userId = user?.userId;

  useEffect(() => {
    setEntries(readHistoryEntries(userId));
  }, [refreshKey, userId]);

  useEffect(() => {
    const handleHistoryChanged = () => {
      setEntries(readHistoryEntries(userId));
    };

    window.addEventListener(VIDEO_HISTORY_CHANGED_EVENT, handleHistoryChanged);
    return () => {
      window.removeEventListener(
        VIDEO_HISTORY_CHANGED_EVENT,
        handleHistoryChanged
      );
    };
  }, [userId]);

  const results = useMemo<TranscriptSearchResult[]>(() => {
    if (query.trim()) {
      return searchTranscriptHistory(query, entries);
    }
    return entries.map((entry) => ({ entry, matchedIn: [] }));
  }, [query, entries]);

  const handleRemove = (videoId: string) => {
    setEntries(removeFromTranscriptHistory(videoId));
    if (isBackendV2Enabled() && getAccessToken()) {
      void deleteVideoHistory(videoId).catch((error) => {
        console.warn('[video-history] Failed to delete from server:', error);
      });
    }
  };

  const handleClear = () => {
    const videoIds = entries.map((entry) => entry.videoId);
    clearTranscriptHistory();
    setEntries([]);
    setQuery('');

    if (isBackendV2Enabled() && getAccessToken()) {
      void Promise.all(
        videoIds.map((videoId) =>
          deleteVideoHistory(videoId).catch((error) => {
            console.warn('[video-history] Failed to delete from server:', error);
          })
        )
      );
    }
  };

  // Empty history: hide the whole section (no search/clear chrome).
  if (entries.length === 0 && !query.trim()) {
    return null;
  }

  return (
    <section
      aria-label={t('history.title')}
      className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/70 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('history.title')}
        </h2>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition"
          >
            {t('common.clear')}
          </button>
        )}
      </div>
      {!query.trim() && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('history.recentHint')}
        </p>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('history.searchPlaceholder')}
        className="w-full px-3 py-2 mb-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      {query.trim() && results.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('history.noResults')}
        </p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {results.map(({ entry, matchedIn, snippet }) => (
            <li
              key={`${entry.videoId}-${entry.savedAt}`}
              className="group flex items-stretch gap-2 rounded-lg border border-transparent bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50/70 dark:bg-gray-800/70 dark:hover:border-blue-700 dark:hover:bg-gray-800"
            >
              <button
                type="button"
                onClick={() => onLoad(entry)}
                disabled={isLoading}
                className="flex flex-1 items-start gap-3 text-left px-2.5 py-2 min-w-0 disabled:opacity-50"
                title={entry.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumbnailUrl(entry.videoId)}
                  alt=""
                  width={96}
                  height={54}
                  loading="lazy"
                  className="h-14 w-24 shrink-0 rounded-md object-cover bg-gray-200 dark:bg-gray-700"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {entry.title}
                  </span>
                  {snippet && (
                    <span className="block text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {snippet}
                    </span>
                  )}
                  <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatHistoryDate(entry.savedAt, locale)}</span>
                    {matchedIn.includes('title') && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700">
                        {t('history.matchTitle')}
                      </span>
                    )}
                    {matchedIn.includes('text') && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700">
                        {t('history.matchText')}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRemove(entry.videoId)}
                className="shrink-0 self-center px-3 py-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                aria-label={t('history.remove')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
