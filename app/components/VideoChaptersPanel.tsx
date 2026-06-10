'use client';

import { useCallback, useEffect, useState } from 'react';
import { getChaptersCache, setChaptersCache } from '../lib/chaptersCache';
import { findActiveLineIndex } from '../lib/timestamp';
import type { VideoChaptersResult } from '../lib/videoChapters';
import { useI18n } from './InterfaceLanguageProvider';

interface TranscriptItem {
  text: string;
  start?: string;
}

interface VideoChaptersPanelProps {
  videoId: string;
  transcript: TranscriptItem[];
  transcriptTextLength: number;
  showPanel?: boolean;
  onShowPanelChange?: (show: boolean) => void;
  hideButton?: boolean;
  onSeek: (seconds: number, lineIndex: number) => void;
}

export default function VideoChaptersPanel({
  videoId,
  transcript,
  transcriptTextLength,
  showPanel: controlledShowPanel,
  onShowPanelChange,
  hideButton = false,
  onSeek,
}: VideoChaptersPanelProps) {
  const { taskLanguage, t } = useI18n();
  const [chapters, setChapters] = useState<VideoChaptersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [internalShowPanel, setInternalShowPanel] = useState(false);
  const showPanel = controlledShowPanel ?? internalShowPanel;

  const setShowPanel = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(showPanel) : value;
    if (onShowPanelChange) {
      onShowPanelChange(next);
    } else {
      setInternalShowPanel(next);
    }
  };

  useEffect(() => {
    setChapters(null);
    setLoading(false);
    setError('');
    setFromCache(false);
    if (!onShowPanelChange) {
      setInternalShowPanel(false);
    }
  }, [videoId, transcriptTextLength, taskLanguage, onShowPanelChange]);

  const loadChapters = useCallback(async () => {
    setError('');
    setShowPanel(true);

    const cached = getChaptersCache(videoId, transcriptTextLength, taskLanguage);
    if (cached) {
      setChapters(cached);
      setFromCache(true);
      return;
    }

    setLoading(true);
    setFromCache(false);
    setChapters(null);

    try {
      const response = await fetch('/api/generate-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          taskLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate chapters');
      }

      const result: VideoChaptersResult = {
        chapters: data.chapters ?? [],
      };

      if (result.chapters.length === 0) {
        throw new Error(t('chapters.empty'));
      }

      setChaptersCache(videoId, transcriptTextLength, taskLanguage, result);
      setChapters(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('chapters.error'));
      setChapters(null);
    } finally {
      setLoading(false);
    }
  }, [taskLanguage, setShowPanel, t, transcript, transcriptTextLength, videoId]);

  useEffect(() => {
    if (!showPanel || chapters || loading) return;
    void loadChapters();
  }, [showPanel, chapters, loading, loadChapters]);

  const handleSeek = (seconds: number) => {
    const lineIndex = findActiveLineIndex(transcript, seconds);
    onSeek(seconds, lineIndex);
  };

  return (
    <>
      {!hideButton && (
        <button
          type="button"
          onClick={loadChapters}
          disabled={loading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showPanel
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900'
          }`}
        >
          {loading ? t('common.loading') : t('actions.chapters')}
        </button>
      )}

      {showPanel && (
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              {t('chapters.title')}
              {fromCache && (
                <span className="ml-2 text-xs font-normal text-indigo-500 dark:text-indigo-400">
                  {t('common.cache')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition"
              aria-label={t('chapters.close')}
            >
              ✕
            </button>
          </div>

          {loading && (
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              {t('chapters.generating')}
            </p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {chapters && !loading && chapters.chapters.length > 0 && (
            <ol className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {chapters.chapters.map((chapter, index) => (
                <li
                  key={`${chapter.seconds}-${index}`}
                  className="bg-white/70 dark:bg-gray-900/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/40 rounded-lg transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSeek(chapter.seconds)}
                    className="w-full text-left px-3 py-2 min-w-0"
                    title={t('chapters.goTo')}
                  >
                    <span className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono tabular-nums">
                      {chapter.timestamp}
                    </span>
                    <span className="block text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {index + 1}. {chapter.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  );
}
