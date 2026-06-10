'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDecks, type Deck } from '../lib/decks';
import { getFlashcards, type Flashcard } from '../lib/flashcards';
import {
  getAchievements,
  getDailyGoalProgress,
  getDeckProgressList,
  getLearningOverview,
  getVideoProgressList,
  getWeakWords,
  stateBarPercent,
} from '../lib/learningAnalytics';
import type { CardState } from '../lib/flashcardSrs';
import { saveDailyCardGoal } from '../lib/learningGoals';
import { getTranscriptHistory } from '../lib/transcriptHistory';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface LearningAnalyticsPanelProps {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4 text-center">
      <p className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function DistributionBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const percent = stateBarPercent(count, total);

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {count}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRow({
  title,
  total,
  studied,
  mastered,
  labels,
}: {
  title: string;
  total: number;
  studied: number;
  mastered: number;
  labels: { words: string; studied: string; mastered: string };
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {total} {labels.words}
        </span>
        <span>
          {studied} {labels.studied}
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          {mastered} {labels.mastered}
        </span>
      </div>
    </div>
  );
}

const STATE_COLORS: Record<CardState, string> = {
  new: 'bg-slate-400',
  learning: 'bg-amber-500',
  review: 'bg-blue-500',
  mastered: 'bg-emerald-500',
};

export default function LearningAnalyticsPanel({
  refreshKey,
  activeVideoId,
  activeVideoTitle,
}: LearningAnalyticsPanelProps) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [goalVersion, setGoalVersion] = useState(0);

  useEffect(() => {
    setCards(getFlashcards());
    setDecks(getDecks());
    setReady(true);
  }, [refreshKey]);

  const titleByVideoId = useMemo(() => {
    const map: Record<string, string> = {};
    if (activeVideoId && activeVideoTitle) {
      map[activeVideoId] = activeVideoTitle;
    }
    for (const entry of getTranscriptHistory()) {
      map[entry.videoId] = entry.title;
    }
    for (const card of cards) {
      if (card.videoId && card.videoTitle) {
        map[card.videoId] = card.videoTitle;
      }
    }
    return map;
  }, [activeVideoId, activeVideoTitle, cards]);

  const overview = useMemo(() => getLearningOverview(cards), [cards]);
  const videoProgress = useMemo(
    () => getVideoProgressList(cards, titleByVideoId),
    [cards, titleByVideoId]
  );
  const deckProgress = useMemo(
    () => getDeckProgressList(cards, decks),
    [cards, decks]
  );
  const weakWords = useMemo(() => getWeakWords(cards), [cards]);
  const achievements = useMemo(() => getAchievements(cards), [cards]);
  const dailyGoal = useMemo(
    () => getDailyGoalProgress(),
    [cards, goalVersion, refreshKey]
  );

  const stateLabels: Record<CardState, TranslationKey> = {
    new: 'flashcards.stateNew',
    learning: 'flashcards.stateLearning',
    review: 'flashcards.stateReview',
    mastered: 'flashcards.stateMastered',
  };

  const progressLabels = {
    words: t('analytics.wordsShort'),
    studied: t('analytics.studiedShort'),
    mastered: t('analytics.masteredShort'),
  };

  const handleGoalSave = () => {
    const parsed = Number(goalInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    saveDailyCardGoal(parsed);
    setGoalInput('');
    setGoalVersion((v) => v + 1);
  };

  if (!ready) {
    return null;
  }

  if (cards.length === 0) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('analytics.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('analytics.empty')}
        </p>
      </div>
    );
  }

  const goalPercent = Math.min(
    100,
    Math.round((dailyGoal.reviewedToday / dailyGoal.goal) * 100)
  );

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('analytics.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {t('analytics.overview')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label={t('analytics.wordsSaved')}
            value={overview.wordsSaved}
            accent="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label={t('analytics.cardsStudied')}
            value={overview.cardsStudied}
            accent="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            label={t('analytics.masteredWords')}
            value={overview.masteredWords}
            accent="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {t('analytics.distribution')}
          </h3>
          <div className="space-y-3">
            {(['new', 'learning', 'review', 'mastered'] as CardState[]).map(
              (state) => (
                <DistributionBar
                  key={state}
                  label={t(stateLabels[state])}
                  count={overview.stateDistribution[state]}
                  total={overview.wordsSaved}
                  colorClass={STATE_COLORS[state]}
                />
              )
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t('analytics.streak')}
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              🔥 {t('analytics.streakDays', { days: dailyGoal.streak })}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t('analytics.dailyGoal')}
            </h3>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums mb-2">
              {t('analytics.dailyGoalProgress', {
                current: dailyGoal.reviewedToday,
                goal: dailyGoal.goal,
              })}
            </p>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={500}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={String(dailyGoal.goal)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              />
              <button
                type="button"
                onClick={handleGoalSave}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                {t('analytics.saveGoal')}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t('analytics.quizAccuracy')}
            </h3>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
              {overview.quizAccuracyPercent !== null
                ? `${overview.quizAccuracyPercent}%`
                : t('analytics.quizNoData')}
            </p>
          </div>
        </div>
      </section>

      {videoProgress.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.byVideo')}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {videoProgress.map((item) => (
              <ProgressRow
                key={item.videoId}
                title={item.title}
                total={item.totalWords}
                studied={item.studiedWords}
                mastered={item.masteredWords}
                labels={progressLabels}
              />
            ))}
          </div>
        </section>
      )}

      {deckProgress.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.byDeck')}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {deckProgress.map((item) => (
              <ProgressRow
                key={item.deckId}
                title={item.name}
                total={item.totalWords}
                studied={item.studiedWords}
                mastered={item.masteredWords}
                labels={progressLabels}
              />
            ))}
          </div>
        </section>
      )}

      {weakWords.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.weakWords')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('analytics.needsPractice')}
          </p>
          <div className="flex flex-wrap gap-2">
            {weakWords.map((card) => (
              <span
                key={card.id}
                className="text-sm px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900"
              >
                {card.word}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {t('analytics.achievements')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                item.unlocked
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                  : 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900/40'
              }`}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t(item.titleKey)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
