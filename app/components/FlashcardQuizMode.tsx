'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  buildQuizQuestions,
  isQuizAnswerCorrect,
  saveQuizAttempt,
  summarizeQuizSession,
  type QuizFormat,
  type QuizQuestion,
  type QuizSessionSummary,
} from '../lib/flashcardQuiz';
import { recordQuizAnswer, type Flashcard } from '../lib/flashcards';
import FlashcardExampleActions, {
  type FlashcardSentenceHandlers,
} from './FlashcardExampleActions';
import type { TranslationKey } from '../lib/i18n';
import { getTranslationLanguageShortCode } from '../lib/translationLanguages';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardQuizModeProps extends FlashcardSentenceHandlers {
  cards: Flashcard[];
  format: QuizFormat;
  activeVideoId?: string;
  onClose: () => void;
  onComplete: () => void;
}

function questionTypeLabel(
  type: QuizQuestion['type'],
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  targetCode: string
): string {
  switch (type) {
    case 'en-to-ua-mc':
      return t('quiz.typeSourceToTarget', { target: targetCode });
    case 'ua-to-en-mc':
      return t('quiz.typeTargetToSource', { target: targetCode });
    case 'typing-en':
      return t('quiz.typeTypingEn');
    case 'typing-ua':
      return t('quiz.typeTypingUa');
  }
}

export default function FlashcardQuizMode({
  cards,
  format,
  activeVideoId,
  onListenSentence,
  onWatchExample,
  onRepeatSentence,
  onShadowSentence,
  onClose,
  onComplete,
}: FlashcardQuizModeProps) {
  const { t, translationLanguage } = useI18n();
  const targetCode = getTranslationLanguageShortCode(translationLanguage);
  const questions = useMemo(
    () => buildQuizQuestions(cards, { format, translationLanguage }),
    [cards, format, translationLanguage]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingValue, setTypingValue] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<Array<{ card: Flashcard; isCorrect: boolean }>>(
    []
  );
  const [summary, setSummary] = useState<QuizSessionSummary | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const isTyping =
    currentQuestion?.type === 'typing-en' ||
    currentQuestion?.type === 'typing-ua';

  const finishSession = (
    nextResults: Array<{ card: Flashcard; isCorrect: boolean }>
  ) => {
    setSummary(summarizeQuizSession(nextResults));
  };

  const submitAnswer = (userAnswer: string) => {
    if (!currentQuestion || answered) return;

    const correct = isQuizAnswerCorrect(userAnswer, currentQuestion.correctAnswer);
    setAnswered(true);
    setIsCorrect(correct);

    recordQuizAnswer(currentQuestion.cardId, correct);
    saveQuizAttempt({
      cardId: currentQuestion.cardId,
      isCorrect: correct,
      questionType: currentQuestion.type,
    });

    setResults((prev) => [
      ...prev,
      { card: currentQuestion.card, isCorrect: correct },
    ]);
  };

  const handleMultipleChoice = (option: string) => {
    if (answered) return;
    submitAnswer(option);
  };

  const handleTypingSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!typingValue.trim()) return;
    submitAnswer(typingValue);
  };

  const handleNext = () => {
    if (currentIndex >= total - 1) return;
    setCurrentIndex((prev) => prev + 1);
    setTypingValue('');
    setAnswered(false);
    setIsCorrect(false);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{t('quiz.notEnoughCards')}</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          {t('flashcards.closeStudy')}
        </button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          {t('quiz.complete')}
        </h2>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 text-center space-y-3 mb-6">
          <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {t('quiz.correctCount', { count: summary.correct })}
          </p>
          <p className="text-red-700 dark:text-red-400 font-semibold">
            {t('quiz.wrongCount', { count: summary.wrong })}
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t('quiz.score', { percent: summary.scorePercent })}
          </p>
        </div>

        {summary.weakCards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('quiz.needsPractice')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.weakCards.map((card) => (
                <span
                  key={card.id}
                  className="text-sm px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200"
                >
                  {card.word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
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

  if (!currentQuestion) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('quiz.progress', { current: currentIndex + 1, total })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {t('flashcards.closeStudy')}
        </button>
      </div>

      <p className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-3 text-center">
        {questionTypeLabel(currentQuestion.type, t, targetCode)}
      </p>

      <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-8 mb-4 text-center">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
          {currentQuestion.prompt}
        </p>
        <p className="text-3xl text-gray-400 dark:text-gray-500 mt-4">?</p>
      </div>

      {!answered && isTyping && (
        <form onSubmit={handleTypingSubmit} className="space-y-3 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentQuestion.type === 'typing-en'
              ? t('quiz.typeEnglishWord')
              : t('quiz.typeTranslation')}
          </label>
          <input
            type="text"
            value={typingValue}
            onChange={(e) => setTypingValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!typingValue.trim()}
            className="w-full min-h-11 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {t('quiz.checkAnswer')}
          </button>
        </form>
      )}

      {!answered && !isTyping && currentQuestion.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={`${currentQuestion.id}-${index}`}
              type="button"
              onClick={() => handleMultipleChoice(option)}
              className="min-h-12 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 transition"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                {index + 1}.
              </span>
              {option}
            </button>
          ))}
        </div>
      )}

      {answered && (
        <div className="space-y-4 mb-4">
          <p
            className={`text-center text-lg font-semibold ${
              isCorrect
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {isCorrect ? t('quiz.correct') : t('quiz.wrong')}
          </p>

          {!isCorrect && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('quiz.correctAnswer')}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentQuestion.correctAnswer}
              </p>
              {currentQuestion.card.example && (
                <p className="text-sm italic text-gray-700 dark:text-gray-300">
                  &quot;{currentQuestion.card.example}&quot;
                </p>
              )}
              <FlashcardExampleActions
                card={currentQuestion.card}
                activeVideoId={activeVideoId}
                compact
                onListenSentence={onListenSentence}
                onWatchExample={onWatchExample}
                onRepeatSentence={onRepeatSentence}
                onShadowSentence={onShadowSentence}
              />
            </div>
          )}

          {currentIndex < total - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-11 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {t('quiz.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => finishSession(results)}
              className="w-full min-h-11 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {t('quiz.showResults')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
