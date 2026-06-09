'use client';

import { FormEvent, useState } from 'react';
import type { TranscriptHistoryEntry } from '../lib/transcriptHistory';
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
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    try {
      await onSubmit(url);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900 border border-blue-400 dark:border-blue-800 rounded-lg shadow-lg p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">YouTube Translator</h1>
      <p className="text-blue-100 mb-6">
        Paste a YouTube URL to extract and work with its transcript
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Paste YouTube URL here (https://youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-white dark:focus:ring-blue-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="text-sm text-white bg-red-500 bg-opacity-40 p-3 rounded border border-red-300">
            <p className="font-semibold mb-2">⚠️ Note:</p>
            <p>{error}</p>
            {error.includes('captions') && (
              <div className="mt-2 text-xs space-y-1">
                <p className="font-semibold">💡 Try these tips:</p>
                <ul className="list-disc list-inside">
                  <li>Use videos with captions enabled (CC button visible)</li>
                  <li>Try music videos or educational content - they usually have captions</li>
                  <li>Some videos have auto-generated captions</li>
                  <li>Check if the video language is set correctly</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white text-blue-600 dark:bg-blue-500 dark:text-white font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Get Transcript'}
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
        <p className="font-semibold mb-2">✓ Supported formats:</p>
        <ul className="list-disc list-inside">
          <li>https://youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://youtube.com/embed/VIDEO_ID</li>
        </ul>
        <p className="text-xs mt-3 text-blue-200">
          Works best with videos that have captions or auto-generated subtitles enabled
        </p>
      </div>
    </div>
  );
}
