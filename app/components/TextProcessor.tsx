'use client';

import { useMemo, useState } from 'react';
import { enrichWordsForFlashcards } from '../lib/enrichFlashcards';
import { getFlashcardCandidatesFromResponse } from '../lib/flashcardCandidates';
import { getFlashcardWordSet, hasFlashcard } from '../lib/flashcards';
import type { ParsedFlashcardItem } from '../lib/parseFlashcardList';
import { parseFlashcardList } from '../lib/parseFlashcardList';

interface TextProcessorProps {
  text: string;
  videoId?: string;
  flashcardsRefreshKey?: number;
  onSaveToFlashcards?: (word: string, example: string, translation?: string) => void;
  onSaveManyToFlashcards?: (items: ReturnType<typeof parseFlashcardList>) => void;
}

interface ResponseItem {
  id: number;
  query: string;
  result: string;
  truncated: boolean;
}

export default function TextProcessor({
  text,
  videoId,
  flashcardsRefreshKey = 0,
  onSaveToFlashcards,
  onSaveManyToFlashcards,
}: TextProcessorProps) {
  const savedWords = useMemo(
    () => getFlashcardWordSet(),
    [flashcardsRefreshKey]
  );

  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrichingId, setEnrichingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          query,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process text');
        return;
      }

      setResponses((prev) => [
        ...prev,
        {
          id: Date.now(),
          query,
          result: data.result,
          truncated: Boolean(data.truncated),
        },
      ]);
    } catch (err) {
      setError('Error connecting to AI service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleProcess();
    }
  };

  const openBulkSave = (items: ParsedFlashcardItem[]) => {
    if (!onSaveManyToFlashcards || items.length === 0) return;
    onSaveManyToFlashcards(items);
  };

  const handleEnrichAndSave = async (
    words: string[],
    readyItems: ParsedFlashcardItem[] = []
  ) => {
    const newWords = words.filter(
      (word) => !savedWords.has(word.trim().toLowerCase())
    );

    if (newWords.length === 0 && readyItems.length === 0) return;

    setEnrichingId(-1);
    setError('');

    try {
      let enriched: ParsedFlashcardItem[] = [];

      if (newWords.length > 0) {
        enriched = await enrichWordsForFlashcards(newWords, text);
      }

      const merged = [...readyItems, ...enriched];
      const unique = new Map<string, ParsedFlashcardItem>();

      for (const item of merged) {
        const key = item.word.toLowerCase();
        if (!unique.has(key)) unique.set(key, item);
      }

      const finalItems = Array.from(unique.values()).filter(
        (item) => !savedWords.has(item.word.trim().toLowerCase())
      );

      if (finalItems.length === 0) {
        setError('Усі слова вже є в картках або AI не повернув переклад');
        return;
      }

      openBulkSave(finalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збагачення слів');
    } finally {
      setEnrichingId(null);
    }
  };

  const handleEnrichSingle = async (word: string) => {
    if (!onSaveToFlashcards || hasFlashcard(word)) return;

    setEnrichingId(-1);
    setError('');

    try {
      const [enriched] = await enrichWordsForFlashcards([word], text);
      if (!enriched) {
        setError('AI не повернув переклад для цього слова');
        return;
      }

      onSaveToFlashcards(
        enriched.word,
        enriched.example,
        enriched.translation
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збагачення слова');
    } finally {
      setEnrichingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
        Text Analysis
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        Задайте AI-запит до транскрипту відео: знайдіть фразові дієслова, перекладіть
        фрагмент, зробіть резюме або поставте будь-яке питання про текст. Якщо відповідь
        містить список слів без перекладу (наприклад, «Hello — 6 разів»), спочатку натисніть
        «Додати переклад через AI» — і лише потім збережіть у Flashcards.
      </p>

      {/* Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ваш запит (Ctrl+Enter — надіслати)
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напр.: «Знайди всі phrasal verbs і дай переклад українською»"
          className="w-full h-20 px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleProcess}
        disabled={loading || !query.trim()}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Обробка...' : '✨ Аналізувати текст'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-400 dark:border-red-500 rounded">
          <p className="text-red-800 dark:text-red-300 font-medium">Error:</p>
          <p className="text-red-700 dark:text-red-400">{error}</p>
          {error.includes('OPENAI_API_KEY') && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              ℹ️ Додайте OPENAI_API_KEY у .env.local
            </p>
          )}
          {error.includes('Cannot connect to AI API') && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              ℹ️ Переконайтесь, що локальний AI-сервер запущено на порту 1234
            </p>
          )}
        </div>
      )}

      {/* Response List */}
      {responses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Responses ({responses.length})
          </h3>
          <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
            {responses.map((item) => {
              const candidates = getFlashcardCandidatesFromResponse(item.result);
              const { ready, wordsNeedingEnrichment, totalDetected } = candidates;
              const hasCandidates = totalDetected >= 2;
              const hasSingleCandidate = totalDetected === 1;
              const newReady = ready.filter(
                (parsed) => !savedWords.has(parsed.word.trim().toLowerCase())
              );
              const newWordsToEnrich = wordsNeedingEnrichment.filter(
                (word) => !savedWords.has(word.trim().toLowerCase())
              );
              const isEnriching = enrichingId !== null;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-green-50 dark:bg-green-950/40 border-l-4 border-green-400 dark:border-green-500 rounded"
                >
                  {item.truncated && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      Текст було скорочено через обмеження контексту моделі.
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    Query: {item.query}
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border border-green-200 dark:border-green-800 max-h-64 overflow-y-auto">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {item.result}
                    </p>
                  </div>

                  {hasCandidates && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Знайдено {totalDetected} слів
                        {newReady.length + newWordsToEnrich.length <
                          totalDetected &&
                          ` · вже є: ${totalDetected - newReady.length - newWordsToEnrich.length}`}
                        {newWordsToEnrich.length > 0 &&
                          ` · потрібен переклад: ${newWordsToEnrich.length}`}
                      </p>
                      <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
                        {ready.map((parsed, index) => {
                          const exists = savedWords.has(
                            parsed.word.trim().toLowerCase()
                          );

                          return (
                            <li
                              key={`ready-${parsed.word}-${index}`}
                              className="flex items-start justify-between gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <span className={exists ? 'opacity-60' : undefined}>
                                <strong>{parsed.word}</strong>
                                <span className="text-green-700 dark:text-green-400">
                                  {' '}
                                  — {parsed.translation}
                                </span>
                                {exists && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    вже в картках
                                  </span>
                                )}
                              </span>
                              {onSaveToFlashcards && videoId && !exists && (
                                <button
                                  type="button"
                                  disabled={isEnriching}
                                  onClick={() =>
                                    onSaveToFlashcards(
                                      parsed.word,
                                      parsed.example,
                                      parsed.translation
                                    )
                                  }
                                  className="shrink-0 text-amber-600 dark:text-amber-400 hover:underline text-xs disabled:opacity-50"
                                >
                                  📇
                                </button>
                              )}
                            </li>
                          );
                        })}
                        {wordsNeedingEnrichment.map((word, index) => {
                          const exists = savedWords.has(word.trim().toLowerCase());

                          return (
                            <li
                              key={`enrich-${word}-${index}`}
                              className="flex items-start justify-between gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <span className={exists ? 'opacity-60' : undefined}>
                                <strong>{word}</strong>
                                <span className="ml-2 text-xs text-amber-700 dark:text-amber-300">
                                  потрібен переклад
                                </span>
                                {exists && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    вже в картках
                                  </span>
                                )}
                              </span>
                              {videoId && !exists && (
                                <button
                                  type="button"
                                  disabled={isEnriching}
                                  onClick={() => handleEnrichSingle(word)}
                                  className="shrink-0 text-amber-600 dark:text-amber-400 hover:underline text-xs disabled:opacity-50"
                                >
                                  🪄
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.result);
                        alert('Result copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                    >
                      📋 Copy Result
                    </button>
                    {videoId && hasCandidates && newWordsToEnrich.length > 0 && (
                      <button
                        onClick={() =>
                          handleEnrichAndSave(newWordsToEnrich, newReady)
                        }
                        disabled={isEnriching}
                        className="px-4 py-2 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                      >
                        {isEnriching
                          ? '⏳ Додаємо переклад...'
                          : `🪄 Додати переклад через AI (${newWordsToEnrich.length})`}
                      </button>
                    )}
                    {onSaveManyToFlashcards &&
                      videoId &&
                      hasCandidates &&
                      newReady.length > 0 &&
                      newWordsToEnrich.length === 0 && (
                        <button
                          onClick={() => openBulkSave(newReady)}
                          disabled={isEnriching}
                          className="px-4 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                        >
                          📇 Зберегти нові ({newReady.length})
                        </button>
                      )}
                    {onSaveToFlashcards && videoId && hasSingleCandidate && (
                      <button
                        onClick={() => {
                          const singleReady = ready[0];
                          const singleWord = wordsNeedingEnrichment[0];

                          if (singleReady) {
                            if (hasFlashcard(singleReady.word)) return;
                            onSaveToFlashcards(
                              singleReady.word,
                              singleReady.example,
                              singleReady.translation
                            );
                            return;
                          }

                          if (singleWord) {
                            handleEnrichSingle(singleWord);
                            return;
                          }

                          const fallback = parseFlashcardList(item.result)[0];
                          if (fallback) {
                            handleEnrichSingle(fallback.word);
                          }
                        }}
                        disabled={isEnriching}
                        className="px-4 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {isEnriching
                          ? '⏳...'
                          : wordsNeedingEnrichment[0]
                            ? '🪄 Додати переклад'
                            : ready[0] && hasFlashcard(ready[0].word)
                              ? '✓ Вже в картках'
                              : '📇 Зберегти в Flashcards'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
