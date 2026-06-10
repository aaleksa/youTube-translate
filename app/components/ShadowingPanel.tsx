'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCueEndSeconds,
  getCueStartSeconds,
  type TranscriptCue,
} from '../lib/transcriptCue';
import { formatTimestamp } from '../lib/timestamp';
import { useI18n } from './InterfaceLanguageProvider';
import PronunciationChecker from './PronunciationChecker';
import { isSpeechRecognitionSupported } from '../lib/speechRecognition';
import type { PhraseChunk } from '../lib/transcriptTypes';
import { timedUnitsToCues } from '../lib/transcriptTypes';

type ShadowingPhase = 'idle' | 'listen' | 'repeat';

interface ShadowingPanelProps {
  videoId: string;
  transcript: TranscriptCue[];
  phrases?: PhraseChunk[];
  currentPlaybackTime: number;
  isPlayerReady: boolean;
  speechLanguage?: string;
  onSeek: (seconds: number, lineIndex: number) => void;
  onPauseVideo: () => void;
  onLineIndexChange?: (lineIndex: number | null) => void;
  onCaptionIndexesChange?: (captionIndexes: number[]) => void;
}

export default function ShadowingPanel({
  videoId,
  transcript,
  phrases,
  currentPlaybackTime,
  isPlayerReady,
  speechLanguage,
  onSeek,
  onPauseVideo,
  onLineIndexChange,
  onCaptionIndexesChange,
}: ShadowingPanelProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<ShadowingPhase>('idle');
  const [finished, setFinished] = useState(false);
  const [requirePronunciation, setRequirePronunciation] = useState(true);
  const [pronunciationChecked, setPronunciationChecked] = useState(false);
  const listenStartedRef = useRef(false);
  const speechSupported = isSpeechRecognitionSupported();
  const pronunciationRequired = requirePronunciation && speechSupported;
  const shadowingLines =
    phrases && phrases.length > 0 ? timedUnitsToCues(phrases) : transcript;

  const notifyLineChange = useCallback(
    (index: number | null) => {
      onLineIndexChange?.(index);
      if (index === null) {
        onCaptionIndexesChange?.([]);
        return;
      }

      onCaptionIndexesChange?.(phrases?.[index]?.captionIndexes ?? [index]);
    },
    [onCaptionIndexesChange, onLineIndexChange, phrases]
  );

  const stopShadowing = useCallback(() => {
    setActive(false);
    setPhase('idle');
    setFinished(false);
    setPronunciationChecked(false);
    listenStartedRef.current = false;
    notifyLineChange(null);
    onPauseVideo();
  }, [notifyLineChange, onPauseVideo]);

  const playLine = useCallback(
    (index: number) => {
      if (!shadowingLines[index]) return;
      listenStartedRef.current = false;
      setLineIndex(index);
      setFinished(false);
      setPronunciationChecked(false);
      notifyLineChange(index);
      const start = getCueStartSeconds(shadowingLines[index]);
      onSeek(start, index);
      setPhase('listen');
    },
    [notifyLineChange, onSeek, shadowingLines]
  );

  const goToNextLine = useCallback(() => {
    if (phase === 'repeat' && pronunciationRequired && !pronunciationChecked) {
      return;
    }

    if (lineIndex >= shadowingLines.length - 1) {
      setPhase('idle');
      setFinished(true);
      setPronunciationChecked(false);
      onPauseVideo();
      return;
    }
    playLine(lineIndex + 1);
  }, [
    lineIndex,
    onPauseVideo,
    phase,
    playLine,
    pronunciationChecked,
    pronunciationRequired,
    shadowingLines.length,
  ]);

  const startShadowing = () => {
    if (shadowingLines.length === 0) return;
    if (!isPlayerReady) return;
    setActive(true);
    setFinished(false);
    playLine(0);
  };

  useEffect(() => {
    if (!active || phase !== 'listen' || shadowingLines.length === 0) return;

    const start = getCueStartSeconds(shadowingLines[lineIndex]);
    if (currentPlaybackTime < start + 0.05) return;

    listenStartedRef.current = true;

    const end = getCueEndSeconds(lineIndex, shadowingLines);
    if (!listenStartedRef.current || currentPlaybackTime < end - 0.15) return;

    onPauseVideo();
    setPronunciationChecked(false);
    setPhase('repeat');
  }, [
    active,
    currentPlaybackTime,
    lineIndex,
    onPauseVideo,
    phase,
    shadowingLines,
  ]);

  useEffect(() => {
    setActive(false);
    setPhase('idle');
    setLineIndex(0);
    setFinished(false);
    setPronunciationChecked(false);
    listenStartedRef.current = false;
    notifyLineChange(null);
  }, [videoId, notifyLineChange]);

  const currentCue = shadowingLines[lineIndex];
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

      <label className="flex items-start gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={requirePronunciation}
          onChange={(e) => setRequirePronunciation(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('shadowing.requirePronunciation')}
        </span>
      </label>

      {!active ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startShadowing}
            disabled={shadowingLines.length === 0}
            className="w-full min-h-11 px-4 py-2.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('shadowing.start')}
          </button>
          {!isPlayerReady && shadowingLines.length > 0 && (
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
              .replace('{total}', String(shadowingLines.length))}
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

          {phase === 'repeat' && requirePronunciation && currentCue && (
            <PronunciationChecker
              expectedText={currentCue.text}
              videoId={videoId}
              sentenceId={phrases?.[lineIndex]?.sentenceId}
              phraseId={phrases?.[lineIndex]?.id}
              speechLanguage={speechLanguage}
              resetKey={`shadowing-${lineIndex}`}
              onReplayOriginal={() => playLine(lineIndex)}
              onChecked={() => setPronunciationChecked(true)}
            />
          )}

          {phase === 'repeat' && pronunciationRequired && !pronunciationChecked && (
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
              {t('shadowing.checkBeforeNext')}
            </p>
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
                if (lineIndex > 0) playLine(lineIndex - 1);
              }}
              disabled={lineIndex === 0}
              className="flex-1 min-w-[7rem] min-h-10 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold transition disabled:opacity-50"
            >
              {t('shadowing.previous')}
            </button>
            <button
              type="button"
              onClick={goToNextLine}
              disabled={
                phase === 'listen' ||
                (phase === 'repeat' &&
                  pronunciationRequired &&
                  !pronunciationChecked)
              }
              className="flex-1 min-w-[7rem] min-h-10 px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finished ? t('shadowing.done') : t('shadowing.next')}
            </button>
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
