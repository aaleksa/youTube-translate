'use client';

import { useEffect, useState } from 'react';
import { getFlashcards, removeFlashcard, type Flashcard } from '../lib/flashcards';
import FlashcardStudyMode from './FlashcardStudyMode';
import { useI18n } from './InterfaceLanguageProvider';

interface FlashcardsPanelProps {
  refreshKey: number;
}

export default function FlashcardsPanel({ refreshKey }: FlashcardsPanelProps) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [search, setSearch] = useState('');
  const [studying, setStudying] = useState(false);

  useEffect(() => {
    setCards(getFlashcards());
  }, [refreshKey]);

  if (studying && cards.length > 0) {
    return (
      <FlashcardStudyMode
        cards={cards}
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('flashcards.title', { count: cards.length })}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {cards.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setStudying(true)}
                className="min-h-10 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition whitespace-nowrap"
              >
                {t('flashcards.study')}
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
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {card.word}
                </h3>
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
          ))}
        </div>
      )}
    </div>
  );
}
