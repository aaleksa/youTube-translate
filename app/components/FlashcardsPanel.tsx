'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createDeck,
  deleteDeck,
  getDeckSummaries,
  getDecks,
  type Deck,
} from '../lib/decks';
import {
  filterFlashcards,
  getCardState,
  getFlashcards,
  getStudyQueue,
  getVideoDeckSummaries,
  removeFlashcard,
  toggleCardDeckMembership,
  type Flashcard,
  type FlashcardView,
} from '../lib/flashcards';
import { startOfDay } from '../lib/flashcardSrs';
import { getTranscriptHistory } from '../lib/transcriptHistory';
import type { TranscriptCue } from '../lib/transcriptCue';
import FlashcardStudyMode from './FlashcardStudyMode';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardsPanelProps {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
  transcript?: TranscriptCue[];
  onReplayInVideo?: (videoId: string, seconds: number) => void;
}

const VIEWS: FlashcardView[] = ['all', 'due', 'video', 'deck'];

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

function viewLabel(view: FlashcardView, t: (key: TranslationKey) => string): string {
  switch (view) {
    case 'all':
      return t('flashcards.viewAll');
    case 'due':
      return t('flashcards.viewDue');
    case 'video':
      return t('flashcards.viewByVideo');
    case 'deck':
      return t('flashcards.viewByDeck');
  }
}

export default function FlashcardsPanel({
  refreshKey,
  activeVideoId,
  activeVideoTitle,
  transcript,
  onReplayInVideo,
}: FlashcardsPanelProps) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [search, setSearch] = useState('');
  const [studying, setStudying] = useState(false);
  const [view, setView] = useState<FlashcardView>('all');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [deleteDeckId, setDeleteDeckId] = useState<string | null>(null);

  useEffect(() => {
    setCards(getFlashcards());
    setDecks(getDecks());
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

  const filterOptions = useMemo(
    () => ({
      view,
      videoId: selectedVideoId ?? undefined,
      deckId: selectedDeckId ?? undefined,
    }),
    [view, selectedDeckId, selectedVideoId]
  );

  const visibleCards = useMemo(
    () => filterFlashcards(cards, filterOptions),
    [cards, filterOptions]
  );

  const studyQueue = useMemo(
    () => getStudyQueue(cards, filterOptions),
    [cards, filterOptions]
  );

  const videoDecks = useMemo(
    () => getVideoDeckSummaries(cards, titleByVideoId),
    [cards, titleByVideoId]
  );

  const deckSummaries = useMemo(
    () => getDeckSummaries(decks, cards),
    [cards, decks]
  );

  const query = search.trim().toLowerCase();
  const filteredCards = query
    ? visibleCards.filter(
        (card) =>
          card.word.toLowerCase().includes(query) ||
          card.translation.toLowerCase().includes(query) ||
          card.example.toLowerCase().includes(query)
      )
    : visibleCards;

  const showGroupList =
    (view === 'video' && !selectedVideoId) ||
    (view === 'deck' && !selectedDeckId);

  const handleViewChange = (nextView: FlashcardView) => {
    setView(nextView);
    setSelectedVideoId(null);
    setSelectedDeckId(null);
    setSearch('');
  };

  const handleCreateDeck = (event: FormEvent) => {
    event.preventDefault();
    const deck = createDeck(newDeckName);
    if (!deck) return;
    setDecks(getDecks());
    setNewDeckName('');
    setSelectedDeckId(deck.id);
    setView('deck');
  };

  const handleDeleteDeck = () => {
    if (!deleteDeckId) return;
    deleteDeck(deleteDeckId);
    setDecks(getDecks());
    setCards(getFlashcards());
    if (selectedDeckId === deleteDeckId) {
      setSelectedDeckId(null);
    }
    setDeleteDeckId(null);
  };

  const handleToggleDeck = (cardId: string, deckId: string) => {
    toggleCardDeckMembership(cardId, deckId);
    setCards(getFlashcards());
  };

  if (studying) {
    return (
      <FlashcardStudyMode
        cards={studyQueue}
        activeVideoId={activeVideoId}
        transcript={transcript}
        onReplayInVideo={onReplayInVideo}
        onClose={() => setStudying(false)}
        onComplete={() => {
          setCards(getFlashcards());
          setDecks(getDecks());
          setStudying(false);
        }}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('flashcards.title', { count: cards.length })}
          </h2>
          {studyQueue.length > 0 && (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-1">
              {t('flashcards.dueTodayBadge', { count: studyQueue.length })}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {cards.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setStudying(true)}
                disabled={studyQueue.length === 0}
                className="min-h-10 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {studyQueue.length > 0
                  ? t('flashcards.studyDue', { count: studyQueue.length })
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

      {cards.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {VIEWS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleViewChange(item)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                view === item
                  ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {viewLabel(item, t)}
            </button>
          ))}
        </div>
      )}

      {view === 'deck' && !selectedDeckId && (
        <form onSubmit={handleCreateDeck} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            placeholder={t('flashcards.deckNamePlaceholder')}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="min-h-10 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition"
          >
            {t('flashcards.createDeck')}
          </button>
        </form>
      )}

      {cards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('flashcards.empty')}
        </p>
      ) : showGroupList ? (
        <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
          {view === 'video' &&
            videoDecks.map((group) => (
              <button
                key={group.videoId}
                type="button"
                onClick={() => setSelectedVideoId(group.videoId)}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  🎥 {group.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('flashcards.groupCount', { count: group.cardsCount })}
                  {group.dueCount > 0 &&
                    ` · ${t('flashcards.groupDue', { count: group.dueCount })}`}
                </p>
              </button>
            ))}

          {view === 'deck' &&
            deckSummaries.map(({ deck, cardsCount, dueCount }) => (
              <div
                key={deck.id}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <button
                  type="button"
                  onClick={() => setSelectedDeckId(deck.id)}
                  className="flex-1 text-left hover:opacity-80 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    📚 {deck.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('flashcards.groupCount', { count: cardsCount })}
                    {dueCount > 0 &&
                      ` · ${t('flashcards.groupDue', { count: dueCount })}`}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteDeckId(deck.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
                >
                  {t('flashcards.deleteDeck')}
                </button>
              </div>
            ))}

          {view === 'video' && videoDecks.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('flashcards.noVideoDecks')}
            </p>
          )}

          {view === 'deck' && deckSummaries.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('flashcards.noDecks')}
            </p>
          )}
        </div>
      ) : filteredCards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {search
            ? t('flashcards.noResults', { query: search })
            : t('flashcards.noCardsInView')}
        </p>
      ) : (
        <>
          {(selectedVideoId || selectedDeckId) && (
            <button
              type="button"
              onClick={() => {
                setSelectedVideoId(null);
                setSelectedDeckId(null);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
            >
              {t('flashcards.backToGroups')}
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto pr-1">
            {filteredCards.map((card) => {
              const state = getCardState(card);
              const isDue = studyQueue.some((item) => item.id === card.id);
              const cardDecks = decks.filter((deck) =>
                card.deckIds.includes(deck.id)
              );

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
                      onClick={() => setCards(removeFlashcard(card.id))}
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
                  {cardDecks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {cardDecks.map((deck) => (
                        <span
                          key={deck.id}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200"
                        >
                          {deck.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {decks.length > 0 && (
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t('flashcards.assignDeck')}
                      <select
                        value=""
                        onChange={(e) => {
                          const deckId = e.target.value;
                          if (!deckId) return;
                          handleToggleDeck(card.id, deckId);
                          e.currentTarget.value = '';
                        }}
                        className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                      >
                        <option value="">{t('flashcards.chooseDeck')}</option>
                        {decks.map((deck) => (
                          <option key={deck.id} value={deck.id}>
                            {card.deckIds.includes(deck.id) ? '✓ ' : ''}
                            {deck.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
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
                  {card.videoId && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      🎥 {card.videoTitle || titleByVideoId[card.videoId] || card.videoId}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {deleteDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('flashcards.deleteDeckTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('flashcards.deleteDeckBody')}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteDeckId(null)}
                className="flex-1 min-h-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                {t('flashcards.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteDeck}
                className="flex-1 min-h-10 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                {t('flashcards.deleteDeckConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
