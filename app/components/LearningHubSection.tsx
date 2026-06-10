'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDueFlashcards, getFlashcards } from '../lib/flashcards';
import { getVocabularyProgress } from '../lib/flashcardSrs';
import {
  getLearningHubOpen,
  getLearningHubTab,
  saveLearningHubOpen,
  saveLearningHubTab,
  type LearningHubTab,
} from '../lib/learningHubSettings';
import type { FlashcardSentenceHandlers } from './FlashcardExampleActions';
import FlashcardsPanel from './FlashcardsPanel';
import LearningAnalyticsPanel from './LearningAnalyticsPanel';
import { useI18n } from './InterfaceLanguageProvider';

interface LearningHubSectionProps extends FlashcardSentenceHandlers {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
}

export default function LearningHubSection({
  refreshKey,
  activeVideoId,
  activeVideoTitle,
  onListenSentence,
  onWatchExample,
  onRepeatSentence,
  onShadowSentence,
}: LearningHubSectionProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LearningHubTab>('flashcards');
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    setOpen(getLearningHubOpen());
    setTab(getLearningHubTab());
  }, []);

  useEffect(() => {
    setStatsVersion((v) => v + 1);
  }, [refreshKey]);

  const summary = useMemo(() => {
    void statsVersion;
    const cards = getFlashcards();
    const progress = getVocabularyProgress(cards);
    const due = getDueFlashcards(cards).length;
    return { total: cards.length, due, mastered: progress.mastered };
  }, [statsVersion, refreshKey]);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      saveLearningHubOpen(next);
      return next;
    });
  };

  const selectTab = (next: LearningHubTab) => {
    setTab(next);
    saveLearningHubTab(next);
    if (!open) {
      setOpen(true);
      saveLearningHubOpen(true);
    }
  };

  const tabClass = (value: LearningHubTab) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition border ${
      tab === value
        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-500'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('learningHub.title')}
            </h2>
            {!open && summary.total > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('learningHub.summary', {
                  count: summary.total,
                  due: summary.due,
                  mastered: summary.mastered,
                })}
              </p>
            )}
            {!open && summary.total === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('learningHub.summaryEmpty')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            aria-expanded={open}
            className="shrink-0 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {open ? t('learningHub.collapse') : t('learningHub.expand')}
          </button>
        </div>

        {open && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectTab('flashcards')}
              className={tabClass('flashcards')}
            >
              {t('learningHub.tabFlashcards')}
              {summary.total > 0 && (
                <span className="ml-1.5 text-xs opacity-80">({summary.total})</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => selectTab('analytics')}
              className={tabClass('analytics')}
            >
              {t('learningHub.tabAnalytics')}
            </button>
            {summary.due > 0 && (
              <span className="self-center text-xs font-medium text-amber-700 dark:text-amber-300">
                {t('flashcards.dueTodayBadge', { count: summary.due })}
              </span>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="p-4 sm:p-5">
          {tab === 'flashcards' ? (
            <FlashcardsPanel
              embedded
              refreshKey={refreshKey}
              activeVideoId={activeVideoId}
              activeVideoTitle={activeVideoTitle}
              onListenSentence={onListenSentence}
              onWatchExample={onWatchExample}
              onRepeatSentence={onRepeatSentence}
              onShadowSentence={onShadowSentence}
            />
          ) : (
            <LearningAnalyticsPanel
              embedded
              refreshKey={refreshKey}
              activeVideoId={activeVideoId}
              activeVideoTitle={activeVideoTitle}
            />
          )}
        </div>
      )}
    </div>
  );
}
