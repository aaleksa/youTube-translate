'use client';

import { useEffect, useState } from 'react';
import {
  CEFR_LEVEL_LABEL_KEYS,
  getCefrLevelStyle,
  type VideoDifficultyResult,
} from '../lib/cefrLevel';
import { fetchAiApi } from '../lib/aiApiClient';
import {
  getDifficultyCache,
  setDifficultyCache,
} from '../lib/difficultyCache';
import { useI18n } from './InterfaceLanguageProvider';

interface VideoDifficultyPanelProps {
  videoId: string;
  transcriptText: string;
}

export default function VideoDifficultyPanel({
  videoId,
  transcriptText,
}: VideoDifficultyPanelProps) {
  const { taskLanguage, t } = useI18n();
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

      const cached = getDifficultyCache(
        videoId,
        transcriptText.length,
        taskLanguage
      );
      if (cached) {
        setResult(cached);
        setFromCache(true);
        return;
      }

      setLoading(true);

      try {
        const response = await fetchAiApi('/api/video-difficulty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: transcriptText,
            taskLanguage,
          }),
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

        setDifficultyCache(
          videoId,
          transcriptText.length,
          taskLanguage,
          assessment
        );
        setResult(assessment);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('cefr.error')
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
  }, [videoId, transcriptText, taskLanguage]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {t('cefr.title')}
      </p>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('cefr.analyzing')}
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
              {t(CEFR_LEVEL_LABEL_KEYS[result.level])}
            </span>
            {fromCache && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({t('common.cache')})
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
