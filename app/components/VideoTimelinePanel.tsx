'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTimelineCache, setTimelineCache } from '../lib/timelineCache';
import { findActiveLineIndex } from '../lib/timestamp';
import type { VideoTimelineResult } from '../lib/videoTimeline';
import { fetchAiApi } from '../lib/aiApiClient';
import { useI18n } from './InterfaceLanguageProvider';

interface TranscriptItem {
  text: string;
  start?: string;
}

interface VideoTimelinePanelProps {
  videoId: string;
  transcript: TranscriptItem[];
  transcriptTextLength: number;
  showPanel?: boolean;
  onShowPanelChange?: (show: boolean) => void;
  hideButton?: boolean;
  onSeek: (seconds: number, lineIndex: number) => void;
}

export default function VideoTimelinePanel({
  videoId,
  transcript,
  transcriptTextLength,
  showPanel: controlledShowPanel,
  onShowPanelChange,
  hideButton = false,
  onSeek,
}: VideoTimelinePanelProps) {
  const { taskLanguage, t } = useI18n();
  const [timeline, setTimeline] = useState<VideoTimelineResult | null>(null);
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
    setTimeline(null);
    setLoading(false);
    setError('');
    setFromCache(false);
    if (!onShowPanelChange) {
      setInternalShowPanel(false);
    }
  }, [videoId, transcriptTextLength, taskLanguage, onShowPanelChange]);

  const loadTimeline = useCallback(async () => {
    setError('');
    setShowPanel(true);

    const cached = getTimelineCache(videoId, transcriptTextLength, taskLanguage);
    if (cached) {
      setTimeline(cached);
      setFromCache(true);
      return;
    }

    setLoading(true);
    setFromCache(false);
    setTimeline(null);

    try {
      const response = await fetchAiApi('/api/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          taskLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate timeline');
      }

      const result: VideoTimelineResult = {
        moments: data.moments ?? [],
      };

      if (result.moments.length === 0) {
        throw new Error(t('timeline.empty'));
      }

      setTimelineCache(videoId, transcriptTextLength, taskLanguage, result);
      setTimeline(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('timeline.error'));
      setTimeline(null);
    } finally {
      setLoading(false);
    }
  }, [taskLanguage, setShowPanel, t, transcript, transcriptTextLength, videoId]);

  useEffect(() => {
    if (!showPanel || timeline || loading) return;
    void loadTimeline();
  }, [showPanel, timeline, loading, loadTimeline]);

  const handleSeek = (seconds: number) => {
    const lineIndex = findActiveLineIndex(transcript, seconds);
    onSeek(seconds, lineIndex);
  };

  return (
    <>
      {!hideButton && (
        <button
          type="button"
          onClick={loadTimeline}
          disabled={loading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showPanel
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'
          }`}
        >
          {loading ? t('common.loading') : t('actions.timeline')}
        </button>
      )}

      {showPanel && (
        <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              {t('timeline.title')}
              {fromCache && (
                <span className="ml-2 text-xs font-normal text-orange-500 dark:text-orange-400">
                  {t('common.cache')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="text-orange-400 hover:text-orange-600 dark:hover:text-orange-200 transition"
              aria-label={t('timeline.close')}
            >
              ✕
            </button>
          </div>

          {loading && (
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {t('timeline.generating')}
            </p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {timeline && !loading && timeline.moments.length > 0 && (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {timeline.moments.map((moment, index) => (
                <li
                  key={`${moment.seconds}-${index}`}
                  className="bg-white/70 dark:bg-gray-900/40 hover:bg-orange-100/80 dark:hover:bg-orange-950/40 rounded-lg transition border border-transparent hover:border-orange-200 dark:hover:border-orange-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSeek(moment.seconds)}
                    className="w-full text-left px-3 py-2 min-w-0"
                    title={t('timeline.goTo')}
                  >
                    <span className="block text-xs font-bold text-orange-700 dark:text-orange-300">
                      {moment.timestamp}
                    </span>
                    <span className="block text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {moment.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
