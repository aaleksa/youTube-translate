'use client';

import { useMemo, useState } from 'react';
import {
  countDueOnDay,
  getFlashcards,
  recordFlashcardReview,
  type Flashcard,
  type ReviewRating,
  type StudySessionSummary,
} from '../lib/flashcards';
import { getWeaknessScore, sortReviewQueue } from '../lib/flashcardSrs';
import { getFlashcardTranslation } from '../lib/flashcardTranslations';
import FlashcardExampleActions, {
  type FlashcardSentenceHandlers,
} from './FlashcardExampleActions';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardStudyModeProps extends FlashcardSentenceHandlers {
  cards: Flashcard[];
  activeVideoId?: string;
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
  onListenSentence,
  onWatchExample,
  onRepeatSentence,
  onShadowSentence,
  onClose,
  onComplete,
}: FlashcardStudyModeProps) {
  const { t, translationLanguage } = useI18n();
  const [queue, setQueue] = useState(() => sortReviewQueue(cards));
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

  const getRatingFeedback = (rating: ReviewRating, intervalDays: number) => {
    if (rating === 'again') return t('flashcards.nextReviewSoon');
    if (intervalDays <= 1) return t('flashcards.nextReviewTomorrow');
    return t('flashcards.nextReviewIn', { days: intervalDays });
  };

  const handleRating = (rating: ReviewRating) => {
    if (!currentCard || isComplete) return;

    const result = recordFlashcardReview(currentCard.id, rating);
    if (!result) return;

    setFeedback(getRatingFeedback(result.rating, result.intervalDays));

    const known = result.known;
    const nextKnown = sessionKnown + (known ? 1 : 0);
    const nextUnknown = sessionUnknown + (known ? 0 : 1);
    let nextQueue = queue;

    if (rating === 'again') {
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
            {getWeaknessScore(currentCard) > 0 && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {t('flashcards.weakCardHint')}
              </p>
            )}
            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {getFlashcardTranslation(currentCard, translationLanguage) || '…'}
            </p>
            {currentCard.example && (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
                &quot;{currentCard.example}&quot;
              </p>
            )}
            <FlashcardExampleActions
              card={currentCard}
              activeVideoId={activeVideoId}
              onListenSentence={onListenSentence}
              onWatchExample={onWatchExample}
              onRepeatSentence={onRepeatSentence}
              onShadowSentence={onShadowSentence}
            />
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
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleRating('again')}
            className="min-h-12 px-3 py-3 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/60 transition"
          >
            {t('flashcards.ratingAgain')}
          </button>
          <button
            type="button"
            onClick={() => handleRating('hard')}
            className="min-h-12 px-3 py-3 rounded-lg border-2 border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/60 transition"
          >
            {t('flashcards.ratingHard')}
          </button>
          <button
            type="button"
            onClick={() => handleRating('good')}
            className="min-h-12 px-3 py-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
          >
            {t('flashcards.ratingGood')}
          </button>
          <button
            type="button"
            onClick={() => handleRating('easy')}
            className="min-h-12 px-3 py-3 rounded-lg border-2 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/60 transition"
          >
            {t('flashcards.ratingEasy')}
          </button>
        </div>
      )}
    </div>
  );
}
