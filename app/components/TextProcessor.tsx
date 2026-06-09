'use client';

import { useMemo, useState } from 'react';
import { getFlashcardWordSet } from '../lib/flashcards';
import type { ParsedFlashcardItem } from '../lib/parseFlashcardList';
import { prepareFlashcardsFromAiResponse } from '../lib/prepareFlashcards';
import VocabularyAnalysis from './VocabularyAnalysis';

interface TextProcessorProps {
  text: string;
  videoId?: string;
  flashcardsRefreshKey?: number;
  onSaveToFlashcards?: (word: string, example: string, translation?: string) => void;
  onSaveManyToFlashcards?: (items: ParsedFlashcardItem[]) => void;
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
  const [preparingId, setPreparingId] = useState<number | null>(null);
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

  const handlePrepareFlashcards = async (item: ResponseItem) => {
    if (!onSaveManyToFlashcards || !videoId) return;

    setPreparingId(item.id);
    setError('');

    try {
      const prepared = await prepareFlashcardsFromAiResponse(item.result, text);
      const newItems = prepared.filter(
        (card) => !savedWords.has(card.word.trim().toLowerCase())
      );

      if (newItems.length === 0) {
        setError(
          prepared.length > 0
            ? 'Усі слова з цієї відповіді вже є в картках'
            : 'AI не знайшов англійських слів для збереження'
        );
        return;
      }

      onSaveManyToFlashcards(newItems);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка підготовки Flashcards'
      );
    } finally {
      setPreparingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
        Text Analysis
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        Задайте будь-який запит до транскрипту. Формат відповіді AI може бути
        різним — вбудовані vocabulary-інструменти допоможуть швидко знайти
        ключові слова, вирази та фрази, а для довільних відповідей натисніть
        «Підготувати Flashcards»: AI сам витягне англійські слова, додасть
        переклад українською та приклад з відео, після чого ви зможете зберегти
        картки.
      </p>

      {videoId && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Vocabulary
          </p>
          <VocabularyAnalysis
            videoId={videoId}
            text={text}
            flashcardsRefreshKey={flashcardsRefreshKey}
            onSaveToFlashcards={onSaveToFlashcards}
            onSaveManyToFlashcards={onSaveManyToFlashcards}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ваш запит (Ctrl+Enter — надіслати)
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напр.: «Знайди phrasal verbs», «Найчастіші слова», «Ключові фрази для таксі»"
          className="w-full h-20 px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleProcess}
        disabled={loading || !query.trim()}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Обробка...' : '✨ Аналізувати текст'}
      </button>

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

      {responses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Responses ({responses.length})
          </h3>
          <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
            {responses.map((item) => {
              const isPreparing = preparingId === item.id;

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
                    {onSaveManyToFlashcards && videoId && (
                      <button
                        onClick={() => handlePrepareFlashcards(item)}
                        disabled={isPreparing || preparingId !== null}
                        className="px-4 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                      >
                        {isPreparing
                          ? '⏳ Готуємо картки...'
                          : '📇 Підготувати Flashcards'}
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
