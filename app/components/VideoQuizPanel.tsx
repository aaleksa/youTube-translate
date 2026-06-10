'use client';

import { useCallback, useEffect, useState } from 'react';
import { getQuizCache, setQuizCache } from '../lib/quizCache';
import {
  scoreQuiz,
  type QuizQuestion,
  type QuizResult,
  type VideoQuiz,
} from '../lib/videoQuiz';
import { useI18n } from './InterfaceLanguageProvider';

interface VideoQuizPanelProps {
  videoId: string;
  transcriptText: string;
  showPanel?: boolean;
  onShowPanelChange?: (show: boolean) => void;
  hideButton?: boolean;
}

type QuizPhase = 'idle' | 'taking' | 'results';

function getResultMessage(percentage: number): string {
  if (percentage >= 90) return 'Чудовий результат! Ви добре зрозуміли відео.';
  if (percentage >= 70) return 'Добре! Є кілька моментів для повторення.';
  if (percentage >= 50) return 'Непогано. Перегляньте відео ще раз.';
  return 'Спробуйте переглянути відео і пройти тест знову.';
}

export default function VideoQuizPanel({
  videoId,
  transcriptText,
  showPanel: controlledShowPanel,
  onShowPanelChange,
  hideButton = false,
}: VideoQuizPanelProps) {
  const { taskLanguage } = useI18n();
  const [quiz, setQuiz] = useState<VideoQuiz | null>(null);
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
  const [phase, setPhase] = useState<QuizPhase>('idle');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    setQuiz(null);
    setLoading(false);
    setError('');
    setFromCache(false);
    setPhase('idle');
    setAnswers({});
    setResult(null);
    if (!onShowPanelChange) {
      setInternalShowPanel(false);
    }
  }, [videoId, transcriptText.length, onShowPanelChange]);

  const resetAttempt = () => {
    setAnswers({});
    setResult(null);
    setPhase('taking');
  };

  const loadQuiz = useCallback(async (forceNew = false) => {
    setError('');
    setShowPanel(true);
    setAnswers({});
    setResult(null);

    if (!forceNew) {
      const cached = getQuizCache(videoId, transcriptText.length);
      if (cached) {
        setQuiz(cached);
        setFromCache(true);
        setPhase('taking');
        return;
      }
    }

    setLoading(true);
    setFromCache(false);
    setPhase('idle');

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcriptText, taskLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const questions: QuizQuestion[] = data.questions ?? [];
      const nextQuiz: VideoQuiz = { questions };
      setQuizCache(videoId, transcriptText.length, nextQuiz);
      setQuiz(nextQuiz);
      setPhase('taking');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка генерації тесту');
      setQuiz(null);
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }, [setShowPanel, transcriptText, videoId, taskLanguage]);

  useEffect(() => {
    if (!showPanel || quiz || loading) return;
    void loadQuiz();
  }, [showPanel, quiz, loading, loadQuiz]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (phase !== 'taking') return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleCheck = () => {
    if (!quiz) return;

    const unanswered = quiz.questions.filter(
      (q) => answers[q.id] === undefined
    );
    if (unanswered.length > 0) {
      setError(`Відповідайте на всі питання (${unanswered.length} залишилось)`);
      return;
    }

    setError('');
    setResult(scoreQuiz(quiz.questions, answers));
    setPhase('results');
  };

  const answeredCount = quiz
    ? quiz.questions.filter((q) => answers[q.id] !== undefined).length
    : 0;

  const handleQuizButton = () => {
    if (loading) return;
    if (quiz) {
      setShowPanel(!showPanel);
      return;
    }
    void loadQuiz();
  };

  return (
    <div className={hideButton ? '' : 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'}>
      {!hideButton && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={handleQuizButton}
            disabled={loading}
            className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
              showPanel
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:hover:bg-cyan-900'
            }`}
          >
            {loading ? '⏳...' : '❓ Quiz'}
          </button>
        </div>
      )}

      {showPanel && (
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
              Тест по відео
              {quiz && phase === 'taking' && ` · ${answeredCount}/${quiz.questions.length}`}
              {fromCache && (
                <span className="ml-2 text-xs font-normal text-cyan-500 dark:text-cyan-400">
                  кеш
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-200 transition"
              aria-label="Закрити тест"
            >
              ✕
            </button>
          </div>

          {loading && (
            <p className="text-sm text-cyan-700 dark:text-cyan-300">
              ⏳ AI генерує питання (5–10)...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          )}

          {quiz && phase === 'results' && result && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200">
                Результат: {result.correct}/{result.total} ({result.percentage}%)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getResultMessage(result.percentage)}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={resetAttempt}
                  className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                >
                  🔄 Спробувати знову
                </button>
                <button
                  type="button"
                  onClick={() => loadQuiz(true)}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  ✨ Новий тест
                </button>
              </div>
            </div>
          )}

          {quiz && !loading && (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {quiz.questions.map((question, qIndex) => {
                const selected = answers[question.id];
                const isChecked = phase === 'results';
                const isCorrect =
                  isChecked && selected === question.correctIndex;
                const isWrong =
                  isChecked &&
                  selected !== undefined &&
                  selected !== question.correctIndex;

                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                        : isWrong
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                          : 'bg-white border-cyan-100 dark:bg-gray-900 dark:border-cyan-900'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      {qIndex + 1}. {question.question}
                    </p>
                    <ul className="space-y-1.5">
                      {question.options.map((option, oIndex) => {
                        const isSelected = selected === oIndex;
                        const isCorrectOption =
                          isChecked && oIndex === question.correctIndex;
                        const showWrongSelected =
                          isChecked && isSelected && oIndex !== question.correctIndex;

                        return (
                          <li key={oIndex}>
                            <label
                              className={`flex items-start gap-2 p-2 rounded-lg text-sm cursor-pointer transition ${
                                phase === 'taking' && isSelected
                                  ? 'bg-cyan-100 dark:bg-cyan-900/50 ring-1 ring-cyan-400'
                                  : isCorrectOption
                                    ? 'bg-green-100 dark:bg-green-900/40 ring-1 ring-green-400'
                                    : showWrongSelected
                                      ? 'bg-red-100 dark:bg-red-900/40 ring-1 ring-red-400'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              } ${phase === 'results' ? 'cursor-default' : ''}`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                checked={isSelected}
                                disabled={phase === 'results'}
                                onChange={() => handleSelect(question.id, oIndex)}
                                className="mt-0.5 shrink-0"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {isChecked && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {quiz && phase === 'taking' && !loading && (
            <button
              type="button"
              onClick={handleCheck}
              className="mt-4 w-full px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition font-medium"
            >
              ✓ Перевірити відповіді
            </button>
          )}
        </div>
      )}
    </div>
  );
}
