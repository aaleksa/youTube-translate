'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCardState,
  getDueFlashcards,
  getFlashcards,
  removeFlashcard,
  type Flashcard,
} from '../lib/flashcards';
import { startOfDay } from '../lib/flashcardSrs';
import type { TranscriptCue } from '../lib/transcriptCue';
import FlashcardStudyMode from './FlashcardStudyMode';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardsPanelProps {
  refreshKey: number;
  activeVideoId?: string;
  transcript?: TranscriptCue[];
  onReplayInVideo?: (videoId: string, seconds: number) => void;
}

function formatDueLabel(
  card: Flashcard,
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => string
): string {
  if (!card.nextReview) return t('flashcards.dueNow');

  const today = startOfDay();
  const days = Math.round((card.nextReview - today) / 86_400_000);

  if (days <= 0) return t('flashcards.dueNow');
  if (days === 1) return t('flashcards.dueInOneDay');
  return t('flashcards.dueInDays', { days });
}

function cardStateLabel(
  state: ReturnType<typeof getCardState>,
  t: (key: TranslationKey) => string
): string {
  switch (state) {
    case 'new':
      return t('flashcards.stateNew');
    case 'learning':
      return t('flashcards.stateLearning');
    case 'review':
      return t('flashcards.stateReview');
    case 'mastered':
      return t('flashcards.stateMastered');
  }
}

export default function FlashcardsPanel({
  refreshKey,
  activeVideoId,
  transcript,
  onReplayInVideo,
}: FlashcardsPanelProps) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [search, setSearch] = useState('');
  const [studying, setStudying] = useState(false);

  useEffect(() => {
    setCards(getFlashcards());
  }, [refreshKey]);

  const dueCards = useMemo(() => getDueFlashcards(cards), [cards]);

  if (studying) {
    return (
      <FlashcardStudyMode
        cards={dueCards}
        activeVideoId={activeVideoId}
        transcript={transcript}
        onReplayInVideo={onReplayInVideo}
        onClose={() => setStudying(false)}
        onComplete={() => {
          setCards(getFlashcards());
          setStudying(false);
        }}
      />
    );
  }

  const handleDelete = (id: string) => {
    setCards(removeFlashcard(id));
  };

  const query = search.trim().toLowerCase();
  const filteredCards = query
    ? cards.filter(
        (card) =>
          card.word.toLowerCase().includes(query) ||
          card.translation.toLowerCase().includes(query) ||
          card.example.toLowerCase().includes(query)
      )
    : cards;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('flashcards.title', { count: cards.length })}
          </h2>
          {dueCards.length > 0 && (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-1">
              {t('flashcards.dueTodayBadge', { count: dueCards.length })}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {cards.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setStudying(true)}
                disabled={dueCards.length === 0}
                className="min-h-10 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dueCards.length > 0
                  ? t('flashcards.studyDue', { count: dueCards.length })
                  : t('flashcards.studyNoneDue')}
              </button>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('flashcards.searchPlaceholder')}
                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('flashcards.empty')}
        </p>
      ) : filteredCards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('flashcards.noResults', { query: search })}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto pr-1">
          {filteredCards.map((card) => {
            const state = getCardState(card);
            const isDue = dueCards.some((dueCard) => dueCard.id === card.id);

            return (
              <div
                key={card.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {card.word}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {cardStateLabel(state, t)}
                      </span>
                      {isDue && (
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                          {t('flashcards.dueNow')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id)}
                    className="text-gray-400 hover:text-red-500 transition text-sm shrink-0"
                    aria-label={t('flashcards.delete')}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-green-700 dark:text-green-400 font-medium mb-2">
                  {card.translation}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                  &quot;{card.example}&quot;
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatDueLabel(card, t)}
                  {card.repetitions > 0 &&
                    ` · ${t('flashcards.repetitions', { count: card.repetitions })}`}
                </p>
                {(card.knownCount > 0 || card.unknownCount > 0) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t('flashcards.stats', {
                      known: card.knownCount,
                      unknown: card.unknownCount,
                    })}
                  </p>
                )}
                <a
                  href={card.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📺 {card.videoId}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
