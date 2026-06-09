'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCueEndSeconds,
  getCueStartSeconds,
  type TranscriptCue,
} from '../lib/transcriptCue';
import { formatTimestamp } from '../lib/timestamp';
import { useI18n } from './InterfaceLanguageProvider';

const REPEAT_PAUSE_OPTIONS = [2, 3, 5, 8] as const;

type ShadowingPhase = 'idle' | 'listen' | 'repeat';

interface ShadowingPanelProps {
  videoId: string;
  transcript: TranscriptCue[];
  currentPlaybackTime: number;
  isPlayerReady: boolean;
  onSeek: (seconds: number, lineIndex: number) => void;
  onPauseVideo: () => void;
  onLineIndexChange?: (lineIndex: number | null) => void;
}

export default function ShadowingPanel({
  videoId,
  transcript,
  currentPlaybackTime,
  isPlayerReady,
  onSeek,
  onPauseVideo,
  onLineIndexChange,
}: ShadowingPanelProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<ShadowingPhase>('idle');
  const [repeatPauseSeconds, setRepeatPauseSeconds] = useState(3);
  const [finished, setFinished] = useState(false);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenStartedRef = useRef(false);

  const clearRepeatTimer = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  }, []);

  const stopShadowing = useCallback(() => {
    clearRepeatTimer();
    setActive(false);
    setPhase('idle');
    setFinished(false);
    listenStartedRef.current = false;
    onLineIndexChange?.(null);
    onPauseVideo();
  }, [clearRepeatTimer, onLineIndexChange, onPauseVideo]);

  const playLine = useCallback(
    (index: number) => {
      if (!transcript[index]) return;
      clearRepeatTimer();
      listenStartedRef.current = false;
      setLineIndex(index);
      setFinished(false);
      onLineIndexChange?.(index);
      const start = getCueStartSeconds(transcript[index]);
      onSeek(start, index);
      setPhase('listen');
    },
    [clearRepeatTimer, onLineIndexChange, onSeek, transcript]
  );

  const goToNextLine = useCallback(() => {
    if (lineIndex >= transcript.length - 1) {
      clearRepeatTimer();
      setPhase('idle');
      setFinished(true);
      onPauseVideo();
      return;
    }
    playLine(lineIndex + 1);
  }, [
    clearRepeatTimer,
    lineIndex,
    onPauseVideo,
    playLine,
    transcript.length,
  ]);

  const startShadowing = () => {
    if (transcript.length === 0) return;
    if (!isPlayerReady) return;
    setActive(true);
    setFinished(false);
    playLine(0);
  };

  useEffect(() => {
    if (!active || phase !== 'listen' || transcript.length === 0) return;

    const start = getCueStartSeconds(transcript[lineIndex]);
    if (currentPlaybackTime < start + 0.05) return;

    listenStartedRef.current = true;

    const end = getCueEndSeconds(lineIndex, transcript);
    if (!listenStartedRef.current || currentPlaybackTime < end - 0.08) return;

    onPauseVideo();
    setPhase('repeat');
  }, [
    active,
    currentPlaybackTime,
    lineIndex,
    onPauseVideo,
    phase,
    transcript,
  ]);

  useEffect(() => {
    if (!active || phase !== 'repeat') return;

    repeatTimerRef.current = setTimeout(() => {
      goToNextLine();
    }, repeatPauseSeconds * 1000);

    return clearRepeatTimer;
  }, [
    active,
    clearRepeatTimer,
    goToNextLine,
    lineIndex,
    phase,
    repeatPauseSeconds,
  ]);

  useEffect(() => {
    return () => clearRepeatTimer();
  }, [clearRepeatTimer]);

  useEffect(() => {
    clearRepeatTimer();
    setActive(false);
    setPhase('idle');
    setLineIndex(0);
    setFinished(false);
    listenStartedRef.current = false;
    onLineIndexChange?.(null);
  }, [videoId, clearRepeatTimer, onLineIndexChange]);

  const currentCue = transcript[lineIndex];
  const phaseLabel =
    phase === 'listen'
      ? t('shadowing.listen')
      : phase === 'repeat'
        ? t('shadowing.repeat')
        : finished
          ? t('shadowing.finished')
          : t('shadowing.idle');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {t('shadowing.title')}
        </h3>
        {active && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200">
            {phaseLabel}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('shadowing.description')}
      </p>

      {!active ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startShadowing}
            disabled={transcript.length === 0}
            className="w-full min-h-11 px-4 py-2.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('shadowing.start')}
          </button>
          {!isPlayerReady && transcript.length > 0 && (
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
              {t('shadowing.waitForPlayer')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('shadowing.progress')
              .replace('{current}', String(lineIndex + 1))
              .replace('{total}', String(transcript.length))}
          </p>

          {currentCue && (
            <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-4">
              <p className="text-xs font-mono text-violet-600 dark:text-violet-300 mb-2">
                {formatTimestamp(currentCue.start)}
              </p>
              <p className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-50 leading-relaxed">
                {currentCue.text}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => playLine(lineIndex)}
              className="flex-1 min-w-[7rem] min-h-10 px-3 py-2 rounded-lg bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100 hover:bg-violet-200 dark:hover:bg-violet-900 text-sm font-semibold transition"
            >
              {t('shadowing.replay')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearRepeatTimer();
                if (lineIndex > 0) playLine(lineIndex - 1);
              }}
              disabled={lineIndex === 0}
              className="flex-1 min-w-[7rem] min-h-10 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold transition disabled:opacity-50"
            >
              {t('shadowing.previous')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearRepeatTimer();
                goToNextLine();
              }}
              className="flex-1 min-w-[7rem] min-h-10 px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 text-sm font-semibold transition"
            >
              {finished ? t('shadowing.done') : t('shadowing.next')}
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t('shadowing.pauseDuration')}
            </label>
            <div className="flex flex-wrap gap-2">
              {REPEAT_PAUSE_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setRepeatPauseSeconds(seconds)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    repeatPauseSeconds === seconds
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={stopShadowing}
            className="w-full min-h-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition"
          >
            {t('shadowing.stop')}
          </button>
        </div>
      )}
    </div>
  );
}
