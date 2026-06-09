'use client';

import { useEffect, useState } from 'react';
import { shouldAutoPause } from '../lib/learningSettings';

interface SelectionTranslateProps {
  selectedText: string;
  targetLanguage?: string;
  onPauseVideo?: () => void;
}

export default function SelectionTranslate({
  selectedText,
  targetLanguage = 'uk',
  onPauseVideo,
}: SelectionTranslateProps) {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setTranslation(null);
    setError('');
  }, [selectedText, targetLanguage]);

  const handleTranslate = async () => {
    if (!selectedText.trim()) return;

    if (shouldAutoPause('translateSelection')) {
      onPauseVideo?.();
    }

    setLoading(true);
    setError('');
    setTranslation(null);

    try {
      const response = await fetch('/api/translate-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: [selectedText],
          targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to translate selection');
        return;
      }

      const translated = data.translations?.[0]?.trim();
      if (!translated) {
        setError('Empty translation response');
        return;
      }

      setTranslation(translated);
    } catch {
      setError('Error connecting to translation service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading || !selectedText.trim()}
        className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Translating...' : '🌍 Translate Selection'}
      </button>

      {(translation || error) && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-teal-200 dark:border-teal-800 relative basis-full w-full">
          <button
            type="button"
            onClick={() => {
              setTranslation(null);
              setError('');
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg leading-none"
            aria-label="Закрити переклад"
          >
            ✕
          </button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 pr-6">{error}</p>
          )}

          {translation && (
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed pr-6">
              {translation}
            </p>
          )}
        </div>
      )}
    </>
  );
}
