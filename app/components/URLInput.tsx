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

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900 border border-blue-400 dark:border-blue-800 rounded-lg shadow-lg p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('urlInput.title')}</h1>
      <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6">{t('urlInput.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder={t('urlInput.placeholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-white text-base text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-white dark:focus:ring-blue-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="text-sm text-white bg-red-500 bg-opacity-40 p-3 rounded border border-red-300">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-11 px-4 py-3 bg-white text-blue-600 dark:bg-blue-500 dark:text-white text-base font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('urlInput.loading') : t('urlInput.getTranscript')}
        </button>
      </form>

      {onLoadFromHistory && (
        <TranscriptHistorySearch
          isLoading={isLoading}
          refreshKey={historyRefreshKey}
          onLoad={onLoadFromHistory}
        />
      )}

      <div className="mt-4 text-sm text-blue-100">
        <p className="font-semibold mb-2">{t('urlInput.supportedFormats')}</p>
        <ul className="list-disc list-inside">
          <li>https://youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://youtube.com/embed/VIDEO_ID</li>
        </ul>
        <p className="text-xs mt-3 text-blue-200">{t('urlInput.captionHint')}</p>
      </div>
    </div>
  );
}
