'use client';

import { useEffect, useState } from 'react';
import {
  getCefrLevelLabel,
  getCefrLevelStyle,
  type VideoDifficultyResult,
} from '../lib/cefrLevel';
import {
  getDifficultyCache,
  setDifficultyCache,
} from '../lib/difficultyCache';

interface VideoDifficultyPanelProps {
  videoId: string;
  transcriptText: string;
}

export default function VideoDifficultyPanel({
  videoId,
  transcriptText,
}: VideoDifficultyPanelProps) {
  const [result, setResult] = useState<VideoDifficultyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError('');
      setResult(null);
      setFromCache(false);

      const cached = getDifficultyCache(videoId, transcriptText.length);
      if (cached) {
        setResult(cached);
        setFromCache(true);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/video-difficulty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcriptText }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to assess difficulty');
        }

        if (cancelled) return;

        const assessment: VideoDifficultyResult = {
          level: data.level,
          explanation: data.explanation,
        };

        setDifficultyCache(videoId, transcriptText.length, assessment);
        setResult(assessment);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Помилка аналізу складності'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [videoId, transcriptText]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Рівень складності (CEFR)
      </p>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ⏳ AI аналізує транскрипт...
        </p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {result && !loading && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getCefrLevelStyle(result.level)}`}
            >
              {result.level}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getCefrLevelLabel(result.level)}
            </span>
            {fromCache && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                (кеш)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
