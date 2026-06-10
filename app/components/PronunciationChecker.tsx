'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  comparePronunciation,
  type PronunciationCompareResult,
} from '../lib/pronunciationCompare';
import {
  getBestScoreForPhrase,
  savePronunciationAttempt,
} from '../lib/pronunciationAttempts';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  mapTranscriptLanguageToSpeechLanguage,
} from '../lib/speechRecognition';
import { createShadowingAttempt } from '../lib/pronunciationTypes';
import { useI18n } from './InterfaceLanguageProvider';

interface PronunciationCheckerProps {
  expectedText: string;
  videoId?: string;
  sentenceId?: string;
  phraseId?: string;
  speechLanguage?: string;
  onReplayOriginal?: () => void;
  onChecked?: (result: PronunciationCompareResult) => void;
  resetKey?: string | number;
  compact?: boolean;
}

type CheckerState = 'idle' | 'listening' | 'result' | 'error';

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 90) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
  if (score >= 70) return 'border-amber-500 bg-amber-50 dark:bg-amber-950/40';
  return 'border-red-500 bg-red-50 dark:bg-red-950/40';
}

export default function PronunciationChecker({
  expectedText,
  videoId,
  sentenceId,
  phraseId,
  speechLanguage,
  onReplayOriginal,
  onChecked,
  resetKey,
  compact = false,
}: PronunciationCheckerProps) {
  const { t } = useI18n();
  const [state, setState] = useState<CheckerState>('idle');
  const [result, setResult] = useState<PronunciationCompareResult | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  const gotResultRef = useRef(false);
  const listenStartedAtRef = useRef<number | null>(null);

  const [supported, setSupported] = useState(false);
  const trimmedExpected = expectedText.trim();

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);
  const lang = mapTranscriptLanguageToSpeechLanguage(speechLanguage);

  const cleanupRecognition = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  useEffect(() => {
    gotResultRef.current = false;
    listenStartedAtRef.current = null;
    setState('idle');
    setResult(null);
    setError('');
    cleanupRecognition();
    if (videoId) {
      setBestScore(getBestScoreForPhrase(videoId, phraseId, trimmedExpected));
    } else {
      setBestScore(null);
    }
  }, [resetKey, trimmedExpected, cleanupRecognition, videoId, phraseId]);

  useEffect(() => cleanupRecognition, [cleanupRecognition]);

  const startListening = () => {
    if (!trimmedExpected) return;

    cleanupRecognition();
    gotResultRef.current = false;
    setResult(null);
    setError('');

    const recognition = createSpeechRecognition(lang);
    if (!recognition) {
      setState('error');
      setError(t('pronunciation.unsupported'));
      return;
    }

    recognitionRef.current = recognition;
    listenStartedAtRef.current = performance.now();
    setState('listening');

    const applyTranscript = (transcript: string) => {
      if (!transcript.trim()) return;

      gotResultRef.current = true;
      const comparison = comparePronunciation(trimmedExpected, transcript);
      const durationMs = listenStartedAtRef.current
        ? Math.round(performance.now() - listenStartedAtRef.current)
        : 0;

      if (videoId) {
        const attempt = createShadowingAttempt({
          videoId,
          sentenceId,
          phraseId,
          expectedText: trimmedExpected,
          comparison,
          durationMs,
        });
        savePronunciationAttempt(attempt);
        setBestScore((current) =>
          current === null ? comparison.score : Math.max(current, comparison.score)
        );
      }

      setResult(comparison);
      setState('result');
      onChecked?.(comparison);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i]?.[0]?.transcript ?? '';
      }
      applyTranscript(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setState('error');
      setError(
        event.error === 'not-allowed'
          ? t('pronunciation.micDenied')
          : t('pronunciation.error')
      );
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (gotResultRef.current) return;
      setState((current) => (current === 'listening' ? 'idle' : current));
    };

    try {
      recognition.start();
    } catch {
      setState('error');
      setError(t('pronunciation.error'));
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
  };

  const tryAgain = () => {
    gotResultRef.current = false;
    listenStartedAtRef.current = null;
    setResult(null);
    setError('');
    setState('idle');
    cleanupRecognition();
  };

  if (!trimmedExpected) return null;

  return (
    <div
      className={`rounded-lg border border-rose-200 dark:border-rose-900 ${
        compact
          ? 'p-3 bg-rose-50/70 dark:bg-rose-950/20'
          : 'p-4 bg-rose-50 dark:bg-rose-950/30'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
          {t('pronunciation.title')}
        </p>
        {onReplayOriginal && (
          <button
            type="button"
            onClick={onReplayOriginal}
            className="text-xs text-rose-700 dark:text-rose-300 hover:underline"
          >
            {t('pronunciation.replayOriginal')}
          </button>
        )}
      </div>

      {!supported && (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {t('pronunciation.unsupported')}
        </p>
      )}

      {supported && (
        <div className="space-y-3">
          <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
            {t('pronunciation.hint')}
          </p>

          <div className="flex flex-wrap gap-2">
            {state === 'listening' ? (
              <button
                type="button"
                onClick={stopListening}
                className="min-h-10 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition animate-pulse"
              >
                {t('pronunciation.stopListening')}
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="min-h-10 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition"
              >
                {t('pronunciation.record')}
              </button>
            )}
            {result && state !== 'listening' && (
              <button
                type="button"
                onClick={tryAgain}
                className="min-h-10 px-4 py-2 rounded-lg border border-rose-300 text-rose-800 dark:border-rose-800 dark:text-rose-200 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition"
              >
                {t('pronunciation.tryAgain')}
              </button>
            )}
          </div>

          {state === 'listening' && (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {t('pronunciation.listening')}
            </p>
          )}

          {error && state === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold ${scoreRingColor(result.score)} ${scoreColor(result.score)}`}
                >
                  {result.score}%
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('pronunciation.score')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {result.score >= 90
                      ? t('pronunciation.feedbackGreat')
                      : result.score >= 70
                        ? t('pronunciation.feedbackGood')
                        : t('pronunciation.feedbackRetry')}
                  </p>
                  {bestScore !== null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('pronunciation.bestScore').replace(
                        '{score}',
                        String(bestScore)
                      )}
                    </p>
                  )}
                </div>
              </div>

              {result.missedWords.length > 0 && (
                <p className="text-xs text-red-700 dark:text-red-300">
                  {t('pronunciation.missedWords')}: {result.missedWords.join(', ')}
                </p>
              )}

              {result.spokenText && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {t('pronunciation.youSaid')}:
                  </span>{' '}
                  {result.spokenText}
                </p>
              )}

              {result.words.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {t('pronunciation.wordMatch')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.words.map((word, index) => (
                      <span
                        key={`${word.expected}-${index}`}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          word.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : word.status === 'optional'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 line-through'
                        }`}
                        title={
                          word.status === 'optional'
                            ? t('pronunciation.optionalWord')
                            : word.spoken && word.spoken !== word.expected
                              ? word.spoken
                              : undefined
                        }
                      >
                        {word.status === 'correct'
                          ? '✓ '
                          : word.status === 'optional'
                            ? '~ '
                            : '✗ '}
                        {word.expected}
                      </span>
                    ))}
                    {result.extraWords.map((word, index) => (
                      <span
                        key={`extra-${word}-${index}`}
                        className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      >
                        +{word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
