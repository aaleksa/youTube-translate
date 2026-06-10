'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDecks, type Deck } from '../lib/decks';
import { getFlashcards, type Flashcard } from '../lib/flashcards';
import {
  getAchievements,
  getDailyGoalProgress,
  getDeckProgressList,
  getHardestWords,
  getLearningOverview,
  getPhrasalVerbProgress,
  getRecentActivity,
  getVideoProgressList,
  getWeakWords,
  masteredPercent,
  stateBarPercent,
} from '../lib/learningAnalytics';
import { saveDailyCardGoal } from '../lib/learningGoals';
import { getTranscriptHistory } from '../lib/transcriptHistory';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface LearningAnalyticsPanelProps {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
  embedded?: boolean;
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4 text-center">
      {icon && (
        <p className="text-lg mb-1" aria-hidden>
          {icon}
        </p>
      )}
      <p className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function VideoProgressCard({
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
  labels: {
    words: string;
    studied: string;
    mastered: string;
    masteredProgress: string;
  };
}) {
  const percent = masteredPercent(mastered, total);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          🎥 {title}
        </p>
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
          {percent}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        {labels.masteredProgress}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
        <span>
          {total} {labels.words}
        </span>
        <span>
          {studied} {labels.studied}
        </span>
        <span className="text-emerald-700 dark:text-emerald-400">
          {mastered} {labels.mastered}
        </span>
      </div>
    </div>
  );
}

function DeckProgressCard({
  name,
  total,
  mastered,
  labels,
}: {
  name: string;
  total: number;
  mastered: number;
  labels: { cards: string; mastered: string };
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
        📚 {name}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {total} {labels.cards} ·{' '}
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          {mastered} {labels.mastered}
        </span>
      </p>
    </div>
  );
}

function WordStatsRow({
  card,
  t,
}: {
  card: Flashcard;
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
        {card.word}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
        {t('analytics.correctCount', { count: card.knownCount })} ·{' '}
        {t('analytics.incorrectCount', { count: card.unknownCount })}
      </span>
    </div>
  );
}

export default function LearningAnalyticsPanel({
  refreshKey,
  activeVideoId,
  activeVideoTitle,
  embedded = false,
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
  const hardestWords = useMemo(() => getHardestWords(cards), [cards]);
  const phrasalProgress = useMemo(() => getPhrasalVerbProgress(cards), [cards]);
  const achievements = useMemo(() => getAchievements(cards), [cards]);
  const dailyGoal = useMemo(
    () => getDailyGoalProgress(),
    [cards, goalVersion, refreshKey]
  );
  const recentActivity = useMemo(
    () => getRecentActivity(),
    [cards, goalVersion, refreshKey]
  );

  const progressLabels = {
    words: t('analytics.wordsShort'),
    studied: t('analytics.studiedShort'),
    mastered: t('analytics.masteredShort'),
    masteredProgress: '',
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
    if (embedded) {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 py-4">
          {t('analytics.empty')}
        </p>
      );
    }

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

  const shellClass = embedded
    ? 'space-y-8'
    : 'mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 space-y-8';

  const quizDisplay =
    overview.quizAccuracyPercent !== null
      ? `${overview.quizAccuracyPercent}%`
      : t('analytics.quizNoData');

  const srsDisplay =
    overview.srsSuccessRatePercent !== null
      ? `${overview.srsSuccessRatePercent}%`
      : t('analytics.quizNoData');

  return (
    <div className={shellClass}>
      {!embedded && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('analytics.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {t('analytics.overview')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon="📚"
            label={t('analytics.wordsSaved')}
            value={overview.wordsSaved}
            accent="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon="✅"
            label={t('analytics.masteredWords')}
            value={overview.masteredWords}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon="🔥"
            label={t('analytics.streak')}
            value={t('analytics.streakDays', { days: dailyGoal.streak })}
            accent="text-orange-600 dark:text-orange-400"
          />
          <StatCard
            icon="📈"
            label={t('analytics.quizAccuracy')}
            value={quizDisplay}
            accent="text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard
            label={t('analytics.successRate')}
            value={srsDisplay}
            accent="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            label={t('analytics.cardsStudied')}
            value={overview.cardsStudied}
            accent="text-slate-600 dark:text-slate-300"
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {t('analytics.recentActivity')}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {t('analytics.today')}
        </p>
        {recentActivity.cardsReviewed > 0 ? (
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('analytics.todayReviewed', {
                count: recentActivity.cardsReviewed,
              })}
            </p>
            <p className="text-emerald-700 dark:text-emerald-400">
              {t('analytics.todayCorrect', { count: recentActivity.correct })}
            </p>
            <p className="text-red-700 dark:text-red-400">
              {t('analytics.todayIncorrect', {
                count: recentActivity.incorrect,
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('analytics.noActivityToday')}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('analytics.dailyGoal')}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums mb-2">
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
      </section>

      {weakWords.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {t('analytics.weakWords')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('analytics.needsPractice')}
          </p>
          <div className="space-y-2">
            {weakWords.map((card) => (
              <WordStatsRow key={card.id} card={card} t={t} />
            ))}
          </div>
        </section>
      )}

      {hardestWords.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.hardestWords')}
          </h3>
          <div className="space-y-2">
            {hardestWords.map((card) => (
              <WordStatsRow key={card.id} card={card} t={t} />
            ))}
          </div>
        </section>
      )}

      {videoProgress.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.byVideo')}
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {videoProgress.map((item) => (
              <VideoProgressCard
                key={item.videoId}
                title={item.title}
                total={item.totalWords}
                studied={item.studiedWords}
                mastered={item.masteredWords}
                labels={{
                  ...progressLabels,
                  masteredProgress: t('analytics.videoMasteredProgress', {
                    mastered: item.masteredWords,
                    total: item.totalWords,
                  }),
                }}
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
              <DeckProgressCard
                key={item.deckId}
                name={item.name}
                total={item.totalWords}
                mastered={item.masteredWords}
                labels={{
                  cards: t('analytics.deckCards'),
                  mastered: t('analytics.masteredShort'),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {phrasalProgress.saved > 0 && (
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('analytics.phrasalTitle')}
          </h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {phrasalProgress.saved}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('analytics.phrasalSaved')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {phrasalProgress.mastered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('analytics.phrasalMastered')}
              </p>
            </div>
            <div className="flex-1 min-w-[8rem]">
              <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-3">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{
                    width: `${stateBarPercent(
                      phrasalProgress.mastered,
                      phrasalProgress.saved
                    )}%`,
                  }}
                />
              </div>
            </div>
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
