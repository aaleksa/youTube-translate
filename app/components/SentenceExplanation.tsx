'use client';

import { useEffect, useState } from 'react';
import { shouldAutoPause } from '../lib/learningSettings';
import type { SentenceExplanationResult } from '../lib/sentenceExplanation';

interface SentenceExplanationProps {
  sentence: string;
  onPauseVideo?: () => void;
}

export default function SentenceExplanation({
  sentence,
  onPauseVideo,
}: SentenceExplanationProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentenceExplanationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setResult(null);
    setError('');
  }, [sentence]);

  const handleExplain = async () => {
    if (!sentence.trim()) return;

    if (shouldAutoPause('explainSentence')) {
      onPauseVideo?.();
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/explain-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to explain sentence');
        return;
      }

      setResult({
        meaning: data.meaning,
        difficultWords: data.difficultWords ?? [],
      });
    } catch {
      setError('Error connecting to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleExplain}
        disabled={loading || !sentence.trim()}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Explaining...' : '💬 Explain Sentence'}
      </button>

      {(result || error) && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-indigo-200 dark:border-indigo-800 relative basis-full w-full">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setError('');
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg leading-none"
            aria-label="Закрити пояснення"
          >
            ✕
          </button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 pr-6">{error}</p>
          )}

          {result && (
            <div className="pr-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300 mb-1">
                Зміст
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                {result.meaning}
              </p>

              {result.difficultWords.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300 mb-2">
                    Складні слова
                  </p>
                  <ul className="space-y-2">
                    {result.difficultWords.map((item) => (
                      <li
                        key={item.word}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                          {item.word}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400"> — </span>
                        {item.explanation}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
