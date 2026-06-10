'use client';

import { useMemo, useState } from 'react';
import {
  countDueOnDay,
  getFlashcardVideoUrl,
  getFlashcards,
  recordFlashcardReview,
  resolveFlashcardTimestamp,
  shuffleFlashcards,
  type Flashcard,
  type StudySessionSummary,
} from '../lib/flashcards';
import type { TranscriptCue } from '../lib/transcriptCue';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardStudyModeProps {
  cards: Flashcard[];
  activeVideoId?: string;
  transcript?: TranscriptCue[];
  onReplayInVideo?: (videoId: string, seconds: number) => void;
  onClose: () => void;
  onComplete: () => void;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const filled = total > 0 ? Math.min(current, total) : 0;
  const empty = Math.max(total - filled, 0);

  return (
    <div
      className="font-mono text-sm tracking-widest text-gray-500 dark:text-gray-400"
      aria-hidden
    >
      {'■'.repeat(filled)}
      {'□'.repeat(empty)}
    </div>
  );
}

export default function FlashcardStudyMode({
  cards,
  activeVideoId,
  transcript,
  onReplayInVideo,
  onClose,
  onComplete,
}: FlashcardStudyModeProps) {
  const { t } = useI18n();
  const [queue, setQueue] = useState(() => shuffleFlashcards(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [summary, setSummary] = useState<StudySessionSummary | null>(null);
  const [sessionKnown, setSessionKnown] = useState(0);
  const [sessionUnknown, setSessionUnknown] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const initialTotal = useMemo(() => cards.length, [cards]);
  const currentCard = queue[currentIndex];
  const total = queue.length;
  const isComplete = summary !== null;

  const handleAnswer = (known: boolean) => {
    if (!currentCard || isComplete) return;

    const result = recordFlashcardReview(currentCard.id, known);
    if (!result) return;

    setFeedback(
      known
        ? t('flashcards.nextReviewIn', { days: result.intervalDays })
        : t('flashcards.nextReviewTomorrow')
    );

    const nextKnown = sessionKnown + (known ? 1 : 0);
    const nextUnknown = sessionUnknown + (known ? 0 : 1);
    let nextQueue = queue;

    if (!known) {
      nextQueue = [...queue, result.card];
      setQueue(nextQueue);
    }

    const isLastCard = currentIndex >= nextQueue.length - 1;

    if (isLastCard) {
      setSummary({
        total: nextKnown + nextUnknown,
        known: nextKnown,
        unknown: nextUnknown,
        dueTomorrow: countDueOnDay(getFlashcards(), 1),
      });
      return;
    }

    setSessionKnown(nextKnown);
    setSessionUnknown(nextUnknown);
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  };

  if (isComplete && summary) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          {t('flashcards.studyComplete')}
        </h2>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 text-center space-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            {t('flashcards.reviewed', { count: summary.total })}
          </p>
          <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {t('flashcards.knowCount', { count: summary.known })}
          </p>
          <p className="text-red-700 dark:text-red-400 font-semibold">
            {t('flashcards.unknownCount', { count: summary.unknown })}
          </p>
          {summary.dueTomorrow > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('flashcards.dueTomorrow', { count: summary.dueTomorrow })}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 min-h-11 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {t('flashcards.backToList')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-11 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {t('flashcards.closeStudy')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('flashcards.dueToday', { count: initialTotal })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {t('flashcards.closeStudy')}
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
        {t('flashcards.progress', {
          current: currentIndex + 1,
          total,
        })}
      </p>
      <div className="flex justify-center mb-4">
        <ProgressBar current={currentIndex + 1} total={total} />
      </div>

      {feedback && (
        <p className="text-center text-sm font-medium text-violet-700 dark:text-violet-300 mb-4">
          {feedback}
        </p>
      )}

      <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-8 min-h-[12rem] flex flex-col items-center justify-center text-center">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
          {currentCard.word}
        </p>

        {isFlipped && (
          <div className="mt-6 w-full space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {currentCard.translation}
            </p>
            {currentCard.example && (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
                &quot;{currentCard.example}&quot;
              </p>
            )}
            {(() => {
              const timestamp = resolveFlashcardTimestamp(
                currentCard,
                transcript
              );
              const canReplayInApp =
                Boolean(timestamp) &&
                activeVideoId === currentCard.videoId &&
                Boolean(onReplayInVideo);

              if (canReplayInApp && timestamp !== undefined) {
                return (
                  <button
                    type="button"
                    onClick={() =>
                      onReplayInVideo?.(currentCard.videoId, timestamp)
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('flashcards.repeatSentence')}
                  </button>
                );
              }

              return (
                <a
                  href={getFlashcardVideoUrl(currentCard, transcript)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('flashcards.repeatSentence')}
                </a>
              );
            })()}
          </div>
        )}
      </div>

      {!isFlipped ? (
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setIsFlipped(true);
          }}
          className="mt-6 w-full min-h-12 px-4 py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition"
        >
          {t('flashcards.flip')}
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAnswer(false)}
            className="min-h-12 px-4 py-3 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 font-semibold hover:bg-red-100 dark:hover:bg-red-950/60 transition"
          >
            {t('flashcards.dontKnow')}
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            className="min-h-12 px-4 py-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
          >
            {t('flashcards.know')}
          </button>
        </div>
      )}
    </div>
  );
}
