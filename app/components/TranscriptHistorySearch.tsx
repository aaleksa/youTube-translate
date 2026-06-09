'use client';

import { useEffect, useMemo, useState } from 'react';
import { getInterfaceLocale } from '../lib/i18n';
import {
  clearTranscriptHistory,
  formatHistoryDate,
  getTranscriptHistory,
  removeFromTranscriptHistory,
  searchTranscriptHistory,
  type TranscriptHistoryEntry,
  type TranscriptSearchResult,
} from '../lib/transcriptHistory';
import { useI18n } from './InterfaceLanguageProvider';

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
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<TranscriptHistoryEntry[]>([]);
  const locale = getInterfaceLocale(language);

  useEffect(() => {
    setEntries(getTranscriptHistory());
  }, [refreshKey]);

  const results = useMemo<TranscriptSearchResult[]>(() => {
    if (query.trim()) {
      return searchTranscriptHistory(query);
    }
    return entries.map((entry) => ({ entry, matchedIn: [] }));
  }, [query, entries]);

  const handleRemove = (videoId: string) => {
    setEntries(removeFromTranscriptHistory(videoId));
  };

  const handleClear = () => {
    clearTranscriptHistory();
    setEntries([]);
    setQuery('');
  };

  if (entries.length === 0 && !query.trim()) {
    return null;
  }

  return (
    <div className="mt-5 pt-4 border-t border-blue-400/40">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-blue-100">{t('history.title')}</p>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-blue-200 hover:text-white transition"
          >
            {t('common.clear')}
          </button>
        )}
      </div>
      {!query.trim() && (
        <p className="text-xs text-blue-200/90 mb-3">{t('history.recentHint')}</p>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('history.searchPlaceholder')}
        className="w-full px-3 py-2 mb-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-white dark:focus:ring-blue-400 focus:outline-none"
      />

      {query.trim() && results.length === 0 && (
        <p className="text-sm text-blue-200 mb-2">{t('history.noResults')}</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {results.map(({ entry, matchedIn, snippet }) => (
            <li
              key={`${entry.videoId}-${entry.savedAt}`}
              className="flex items-start gap-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <button
                type="button"
                onClick={() => onLoad(entry)}
                disabled={isLoading}
                className="flex-1 text-left px-3 py-2 min-w-0 disabled:opacity-50"
                title={entry.url}
              >
                <span className="block text-sm font-medium line-clamp-2">
                  {entry.title}
                </span>
                {!query.trim() && (
                  <span className="block text-xs text-blue-200/80 mt-0.5 truncate">
                    {entry.url}
                  </span>
                )}
                {snippet && (
                  <span className="block text-xs text-blue-100/90 mt-1 line-clamp-2">
                    {snippet}
                  </span>
                )}
                <span className="flex flex-wrap items-center gap-2 text-xs text-blue-300/80 mt-1">
                  <span>{formatHistoryDate(entry.savedAt, locale)}</span>
                  {matchedIn.includes('title') && (
                    <span className="px-1.5 py-0.5 rounded bg-white/15">
                      {t('history.matchTitle')}
                    </span>
                  )}
                  {matchedIn.includes('text') && (
                    <span className="px-1.5 py-0.5 rounded bg-white/15">
                      {t('history.matchText')}
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRemove(entry.videoId)}
                className="shrink-0 px-3 py-2 text-blue-200 hover:text-white transition"
                aria-label={t('history.remove')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
