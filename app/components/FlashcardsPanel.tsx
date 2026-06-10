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
  countCardsNeedingEnrichment,
  getCardsNeedingEnrichment,
  runBulkEnrichment,
  type BulkEnrichmentProgress,
} from '../lib/flashcardEnrichment';
import {
  filterFlashcards,
  getCardState,
  getFlashcards,
  getStudyQueue,
  getVideoDeckSummaries,
  removeFlashcard,
  type Flashcard,
  type FlashcardView,
} from '../lib/flashcards';
import {
  ensureFlashcardTranslations,
  getFlashcardTranslation,
} from '../lib/flashcardTranslations';
import { startOfDay } from '../lib/flashcardSrs';
import { getTranscriptHistory } from '../lib/transcriptHistory';
import EditFlashcardModal from './EditFlashcardModal';
import FlashcardExampleActions, {
  type FlashcardSentenceHandlers,
} from './FlashcardExampleActions';
import {
  getQuizPool,
  getWeakFlashcards,
  resolveQuizSourceFromView,
  type QuizFormat,
  type QuizSource,
} from '../lib/flashcardQuiz';
import FlashcardQuizMode from './FlashcardQuizMode';
import FlashcardStudyMode from './FlashcardStudyMode';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardsPanelProps extends FlashcardSentenceHandlers {
  refreshKey: number;
  activeVideoId?: string;
  activeVideoTitle?: string;
  embedded?: boolean;
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
  onListenSentence,
  onWatchExample,
  onRepeatSentence,
  onShadowSentence,
  embedded = false,
}: FlashcardsPanelProps) {
  const { t, translationLanguage, taskLanguage } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [search, setSearch] = useState('');
  const [studying, setStudying] = useState(false);
  const [quizzing, setQuizzing] = useState(false);
  const [quizFormat, setQuizFormat] = useState<QuizFormat>('multiple-choice');
  const [quizSource, setQuizSource] = useState<QuizSource>('due');
  const [view, setView] = useState<FlashcardView>('all');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [deleteDeckId, setDeleteDeckId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkEnrichmentProgress | null>(
    null
  );

  const enrichableCount = useMemo(
    () => countCardsNeedingEnrichment(cards),
    [cards]
  );

  useEffect(() => {
    setCards(getFlashcards());
    setDecks(getDecks());
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await ensureFlashcardTranslations(translationLanguage);
        if (taskLanguage !== translationLanguage) {
          await ensureFlashcardTranslations(taskLanguage);
        }
        if (!cancelled) {
          setCards(getFlashcards());
        }
      } catch {
        // Keep existing cards visible if translation fails (offline / no API key).
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [translationLanguage, taskLanguage, refreshKey]);

  useEffect(() => {
    setQuizzing(false);
    setStudying(false);
  }, [translationLanguage, taskLanguage]);

  useEffect(() => {
    if (!showUpdatedToast) return;
    const timer = window.setTimeout(() => setShowUpdatedToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showUpdatedToast]);

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

  const quizPool = useMemo(() => {
    const resolved = resolveQuizSourceFromView(
      view,
      selectedVideoId,
      selectedDeckId,
      activeVideoId
    );

    return getQuizPool(cards, {
      source: quizSource,
      videoId:
        quizSource === 'video'
          ? selectedVideoId ?? activeVideoId ?? resolved.videoId
          : undefined,
      deckId:
        quizSource === 'deck'
          ? selectedDeckId ?? resolved.deckId
          : undefined,
      translationLanguage: taskLanguage,
    });
  }, [
    activeVideoId,
    cards,
    quizSource,
    selectedDeckId,
    selectedVideoId,
    taskLanguage,
    view,
  ]);

  const weakCards = useMemo(() => getWeakFlashcards(cards), [cards]);

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
          getFlashcardTranslation(card, translationLanguage)
            .toLowerCase()
            .includes(query) ||
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

  const handleCardSaved = (card: Flashcard) => {
    setCards(getFlashcards());
    setDecks(getDecks());
    setShowUpdatedToast(true);
    setEditingCard((current) => (current?.id === card.id ? null : current));
  };

  const handleBulkEnrich = async () => {
    const targets = getCardsNeedingEnrichment(cards, 20);
    if (targets.length === 0 || bulkProgress?.running) return;

    await runBulkEnrichment(
      targets.map((card) => card.id),
      {
        onProgress: setBulkProgress,
      }
    );
    setCards(getFlashcards());
  };

  if (quizzing) {
    return (
      <FlashcardQuizMode
        key={`${taskLanguage}-${quizFormat}-${quizSource}-${view}-${selectedVideoId ?? ''}-${selectedDeckId ?? ''}`}
        cards={quizPool}
        format={quizFormat}
        quizLanguage={taskLanguage}
        activeVideoId={activeVideoId}
        onListenSentence={onListenSentence}
        onWatchExample={onWatchExample}
        onRepeatSentence={onRepeatSentence}
        onShadowSentence={onShadowSentence}
        onClose={() => setQuizzing(false)}
        onComplete={() => {
          setCards(getFlashcards());
          setQuizzing(false);
        }}
      />
    );
  }

  if (studying) {
    return (
      <FlashcardStudyMode
        key={translationLanguage}
        cards={studyQueue}
        activeVideoId={activeVideoId}
        onListenSentence={onListenSentence}
        onWatchExample={onWatchExample}
        onRepeatSentence={onRepeatSentence}
        onShadowSentence={onShadowSentence}
        onClose={() => setStudying(false)}
        onComplete={() => {
          setCards(getFlashcards());
          setDecks(getDecks());
          setStudying(false);
        }}
      />
    );
  }

  const shellClass = embedded ? '' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6';

  return (
    <div className={shellClass}>
      {showUpdatedToast && (
        <p className="mb-4 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          {t('flashcards.cardUpdated')}
        </p>
      )}

      {bulkProgress && (
        <p className="mb-4 text-sm text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          {bulkProgress.running
            ? t('enrichment.bulkRunning', {
                completed: bulkProgress.completed,
                failed: bulkProgress.failed,
                pending: bulkProgress.pending,
              })
            : t('enrichment.bulkDone', {
                completed: bulkProgress.completed,
                failed: bulkProgress.failed,
              })}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          {embedded ? (
            cards.length > 0 && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('flashcards.title', { count: cards.length })}
              </p>
            )
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('flashcards.title', { count: cards.length })}
            </h2>
          )}
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
              <button
                type="button"
                onClick={() => setQuizzing(true)}
                disabled={quizPool.length === 0}
                className="min-h-10 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('quiz.start', { count: Math.min(10, quizPool.length) })}
              </button>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('flashcards.searchPlaceholder')}
                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {enrichableCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleBulkEnrich()}
                  disabled={bulkProgress?.running}
                  className="min-h-10 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('enrichment.bulkEnrich', {
                    count: Math.min(20, enrichableCount),
                  })}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('quiz.sourceLabel')}
            </span>
            {(
              [
                ['due', 'quiz.sourceDue'],
                ['video', 'quiz.sourceVideo'],
                ['deck', 'quiz.sourceDeck'],
                ['weak', 'quiz.sourceWeak'],
                ['all', 'quiz.sourceAll'],
              ] as const
            ).map(([source, labelKey]) => (
              <button
                key={source}
                type="button"
                onClick={() => setQuizSource(source)}
                disabled={source === 'weak' && weakCards.length === 0}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                  quizSource === source
                    ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('quiz.formatLabel')}
            </span>
            {(
              [
                ['multiple-choice', 'quiz.formatMc'],
                ['typing', 'quiz.formatTyping'],
                ['mixed', 'quiz.formatMixed'],
              ] as const
            ).map(([format, labelKey]) => (
              <button
                key={format}
                type="button"
                onClick={() => setQuizFormat(format)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                  quizFormat === format
                    ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingCard(card)}
                        className="text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-1.5 py-0.5"
                      >
                        {t('flashcards.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCards(removeFlashcard(card.id))}
                        className="text-gray-400 hover:text-red-500 transition text-sm px-1"
                        aria-label={t('flashcards.delete')}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="text-green-700 dark:text-green-400 font-medium mb-2">
                    {getFlashcardTranslation(card, translationLanguage) || '…'}
                  </p>
                  {card.example && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                      &quot;{card.example}&quot;
                    </p>
                  )}
                  {(card.tags.length > 0 || cardDecks.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200"
                        >
                          {tag}
                        </span>
                      ))}
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
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                      🎥 {card.videoTitle || titleByVideoId[card.videoId] || card.videoId}
                    </p>
                  )}
                  <FlashcardExampleActions
                    card={card}
                    activeVideoId={activeVideoId}
                    compact
                    onListenSentence={onListenSentence}
                    onWatchExample={onWatchExample}
                    onRepeatSentence={onRepeatSentence}
                    onShadowSentence={onShadowSentence}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      <EditFlashcardModal
        card={editingCard}
        decks={decks}
        onClose={() => setEditingCard(null)}
        onSaved={handleCardSaved}
      />

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
