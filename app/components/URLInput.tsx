'use client';

import { FormEvent, useState } from 'react';
import type { TranscriptHistoryEntry } from '../lib/transcriptHistory';
import { useI18n } from './InterfaceLanguageProvider';
import TranscriptHistorySearch from './TranscriptHistorySearch';

interface URLInputProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  historyRefreshKey?: number;
  onLoadFromHistory?: (entry: TranscriptHistoryEntry) => void;
}

export default function URLInput({
  onSubmit,
  isLoading,
  historyRefreshKey = 0,
  onLoadFromHistory,
}: URLInputProps) {
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError(t('urlInput.enterUrl'));
      return;
    }

    try {
      await onSubmit(url);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('urlInput.errorGeneric'));
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setUrl(text.trim());
        setError('');
      }
    } catch {
      setError(t('urlInput.pasteFailed'));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900 border border-blue-400 dark:border-blue-800 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('urlInput.title')}</h1>
        <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-5">
          {t('urlInput.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1">
              <input
                data-testid="youtube-url-input"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder={t('urlInput.placeholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="w-full min-h-11 px-4 py-3 pr-20 rounded-lg bg-white text-base text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-white dark:focus:ring-blue-400 focus:outline-none disabled:opacity-50"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                {url.trim() ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    disabled={isLoading}
                    aria-label={t('urlInput.clearUrl')}
                    className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 disabled:opacity-50"
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      ×
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handlePaste()}
                    disabled={isLoading}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-md text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {t('urlInput.paste')}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-5 py-3 bg-white text-blue-600 dark:bg-blue-500 dark:text-white text-base font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[11.5rem]"
            >
              {isLoading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                  />
                  <span>{t('urlInput.loading')}</span>
                </>
              ) : (
                t('urlInput.getTranscript')
              )}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="relative text-sm text-white bg-red-500/40 p-3 pr-11 rounded border border-red-300"
            >
              <button
                type="button"
                onClick={() => setError('')}
                aria-label={t('common.close')}
                className="absolute top-2 right-2 inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-white/90 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </button>
              <p className="font-semibold mb-2">{t('urlInput.note')}</p>
              <p>{error}</p>
              {error.includes('captions') && (
                <div className="mt-2 text-xs space-y-1">
                  <p className="font-semibold">{t('urlInput.captionTipsTitle')}</p>
                  <ul className="list-disc list-inside">
                    <li>{t('urlInput.captionTip1')}</li>
                    <li>{t('urlInput.captionTip2')}</li>
                    <li>{t('urlInput.captionTip3')}</li>
                    <li>{t('urlInput.captionTip4')}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>

        <p className="mt-4 text-xs text-blue-200">{t('urlInput.captionHint')}</p>
      </div>

      {onLoadFromHistory && (
        <TranscriptHistorySearch
          isLoading={isLoading}
          refreshKey={historyRefreshKey}
          onLoad={onLoadFromHistory}
        />
      )}
    </div>
  );
}
