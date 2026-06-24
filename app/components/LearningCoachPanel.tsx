'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildCoachAdviceRequest } from '../lib/coachAdvicePayload';
import type { CoachAdviceResponse } from '../lib/coachAdviceTypes';
import { getDecks } from '../lib/decks';
import { getFlashcards } from '../lib/flashcards';
import {
  getLearningGoals,
  saveLearningLevel,
  saveVocabularyGoal,
  type LearningLevel,
} from '../lib/learningGoals';
import {
  generateLearningPlan,
  progressPercent,
  type LearningPlan,
} from '../lib/learningPlan';
import type { TranslationKey } from '../lib/i18n';
import {
  CoachAdviceError,
  fetchCoachAdvice,
} from '../lib/v2/coachAdviceApi';
import { getSubscriptionAccess } from '../lib/v2/subscriptionApi';
import type { PremiumAccessInfo } from '../../v2-core/types';
import { useI18n } from './InterfaceLanguageProvider';

interface LearningCoachPanelProps {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
  embedded?: boolean;
}

function ProgressBar({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const percent = progressPercent(current, target);

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="tabular-nums text-gray-800 dark:text-gray-200">
          {current}/{target}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const LEVELS: LearningLevel[] = ['beginner', 'intermediate', 'advanced'];

const LEVEL_LABELS: Record<LearningLevel, TranslationKey> = {
  beginner: 'coach.level.beginner',
  intermediate: 'coach.level.intermediate',
  advanced: 'coach.level.advanced',
};

export default function LearningCoachPanel({
  refreshKey,
  activeVideoId,
  activeVideoTitle,
  embedded = false,
}: LearningCoachPanelProps) {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [goalsVersion, setGoalsVersion] = useState(0);
  const [vocabGoalInput, setVocabGoalInput] = useState('');
  const [premiumInfo, setPremiumInfo] = useState<PremiumAccessInfo | null>(null);
  const [llmAdvice, setLlmAdvice] = useState<CoachAdviceResponse | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;
    void getSubscriptionAccess()
      .then((access) => {
        if (!cancelled) setPremiumInfo(access);
      })
      .catch(() => {
        if (!cancelled) setPremiumInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, goalsVersion]);

  const plan = useMemo<LearningPlan | null>(() => {
    if (!ready) return null;
    void goalsVersion;
    return generateLearningPlan({
      cards: getFlashcards(),
      decks: getDecks(),
      activeVideoId,
      activeVideoTitle,
    });
  }, [ready, refreshKey, goalsVersion, activeVideoId, activeVideoTitle]);

  const goals = useMemo(() => getLearningGoals(), [goalsVersion]);

  const loadLlmAdvice = useCallback(async () => {
    if (!plan) return;

    setLlmLoading(true);
    setLlmError(null);

    try {
      const advice = await fetchCoachAdvice(
        buildCoachAdviceRequest(getFlashcards(), plan)
      );
      setLlmAdvice(advice);
    } catch (error) {
      setLlmAdvice(null);
      if (error instanceof CoachAdviceError && error.code === 'PREMIUM_REQUIRED') {
        setLlmError(t('coach.llmPremiumRequired'));
      } else {
        setLlmError(
          error instanceof Error ? error.message : t('coach.llmError')
        );
      }
    } finally {
      setLlmLoading(false);
    }
  }, [plan, t]);

  if (!ready || !plan) return null;

  if (plan.vocabularySaved === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400 py-4">
        {t('coach.empty')}
      </p>
    );
  }

  const shellClass = embedded ? 'space-y-8' : 'space-y-8';

  const vocabPercent = progressPercent(plan.vocabularySaved, plan.vocabularyGoal);

  const handleLevelChange = (level: LearningLevel) => {
    saveLearningLevel(level);
    setGoalsVersion((v) => v + 1);
  };

  const handleVocabGoalSave = () => {
    const parsed = Number(vocabGoalInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    saveVocabularyGoal(parsed);
    setVocabGoalInput('');
    setGoalsVersion((v) => v + 1);
  };

  return (
    <div className={shellClass}>
      {!embedded && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('coach.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('coach.subtitle')}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/20 p-4">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
          {t('coach.todayPlan')}
        </h3>
        {plan.dailyItems.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('coach.planEmpty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.dailyItems.map((item) => (
              <li
                key={item.id}
                className={`flex items-start gap-2 text-sm ${
                  item.emphasis === 'high'
                    ? 'font-medium text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{t(item.messageKey, item.params)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/20 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200">
              {t('coach.llmTitle')}
            </h3>
            <p className="text-xs text-violet-800/80 dark:text-violet-300/80 mt-1">
              {t('coach.llmSubtitle')}
            </p>
          </div>
          {premiumInfo?.isPremium && (
            <button
              type="button"
              data-testid="coach-llm-refresh"
              disabled={llmLoading}
              onClick={() => void loadLlmAdvice()}
              className="shrink-0 rounded-lg border border-violet-300 dark:border-violet-700 px-3 py-1.5 text-xs font-medium text-violet-900 dark:text-violet-100 hover:bg-violet-100/70 dark:hover:bg-violet-900/40 disabled:opacity-60"
            >
              {llmLoading ? t('coach.llmLoading') : t('coach.llmRefresh')}
            </button>
          )}
        </div>

        {!premiumInfo?.isPremium ? (
          <p className="text-sm text-violet-900 dark:text-violet-100">
            {t('coach.llmPremiumRequired')}
          </p>
        ) : llmAdvice ? (
          <div className="space-y-3">
            <p className="text-sm text-violet-950 dark:text-violet-50">
              {llmAdvice.summary}
            </p>
            <ul className="space-y-1.5 text-sm text-violet-900 dark:text-violet-100">
              {llmAdvice.focusTips.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-violet-900/90 dark:text-violet-100/90">
              {t('coach.llmEmpty')}
            </p>
            {!llmLoading && (
              <button
                type="button"
                data-testid="coach-llm-generate"
                onClick={() => void loadLlmAdvice()}
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                {t('coach.llmGenerate')}
              </button>
            )}
          </div>
        )}

        {llmLoading && (
          <p className="text-sm text-violet-800 dark:text-violet-200 mt-2">
            {t('coach.llmLoading')}
          </p>
        )}
        {llmError && (
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">{llmError}</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {t('coach.progressTitle')}
        </h3>
        <div className="space-y-3">
          <ProgressBar
            label={t('coach.progress.review')}
            current={plan.progress.review.current}
            target={plan.progress.review.target}
          />
          <ProgressBar
            label={t('coach.progress.quiz')}
            current={plan.progress.quiz.current}
            target={plan.progress.quiz.target}
          />
          <ProgressBar
            label={t('coach.progress.shadowing')}
            current={plan.progress.shadowing.current}
            target={plan.progress.shadowing.target}
          />
          <ProgressBar
            label={t('coach.progress.newWords')}
            current={plan.progress.newWords.current}
            target={plan.progress.newWords.target}
          />
        </div>
      </section>

      {plan.weakWords.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('coach.todayFocus')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.weakWords.map((card) => (
              <span
                key={card.id}
                className="text-sm px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900"
              >
                {card.word}
              </span>
            ))}
          </div>
        </section>
      )}

      {plan.videoReview && (
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('coach.videoReview')}
          </h3>
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            🎥 {plan.videoReview.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('coach.videoReviewStats', {
              total: plan.videoReview.totalWords,
              mastered: plan.videoReview.masteredWords,
              learning: plan.videoReview.learningWords,
            })}
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
            {t('coach.videoReviewHint')}
          </p>
        </section>
      )}

      {plan.recommendedVideos.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('coach.recommendedVideos')}
          </h3>
          <div className="space-y-2">
            {plan.recommendedVideos.map((video) => (
              <div
                key={video.videoId}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  🎥 {video.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('coach.recommendedVideoStats', {
                    learning: video.learningWords,
                    total: video.totalWords,
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.shadowingSentences.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('coach.shadowingTitle')}
          </h3>
          <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
            {plan.shadowingSentences.map((sentence) => (
              <li
                key={sentence.text}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
              >
                {sentence.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {t('coach.weeklyPlan')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {plan.weeklyDays.map((day) => (
            <div
              key={day.dayKey}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                {t(day.dayKey)}
              </p>
              <ul className="space-y-1">
                {day.tasks.map((task, index) => (
                  <li
                    key={`${day.dayKey}-${index}`}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    {task.icon}{' '}
                    {t(task.messageKey, task.params)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {plan.suggestions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('coach.suggestions')}
          </h3>
          <div className="space-y-2">
            {plan.suggestions.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span aria-hidden>{item.icon}</span>
                <span>{t(item.messageKey, item.params)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {plan.advice.length > 0 && (
        <section className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
            {t('coach.adviceTitle')}
          </h3>
          <ul className="space-y-1.5 text-sm text-emerald-900 dark:text-emerald-100">
            {plan.advice.map((item, index) => (
              <li key={index}>💡 {t(item.messageKey, item.params)}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {t('coach.goalsTitle')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {t('coach.vocabularyGoal')}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums mb-2">
          {t('coach.vocabularyProgress', {
            current: plan.vocabularySaved,
            goal: plan.vocabularyGoal,
          })}
        </p>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${vocabPercent}%` }}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min={10}
            value={vocabGoalInput}
            onChange={(e) => setVocabGoalInput(e.target.value)}
            placeholder={String(goals.vocabularyGoal)}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
          />
          <button
            type="button"
            onClick={handleVocabGoalSave}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            {t('coach.saveGoal')}
          </button>
        </div>

        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {t('coach.levelTitle')}
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelChange(level)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                plan.learningLevel === level
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t(LEVEL_LABELS[level])}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
