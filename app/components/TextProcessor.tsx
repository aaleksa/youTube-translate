'use client';

import { useMemo, useState } from 'react';
import { getFlashcardWordSet, hasFlashcard } from '../lib/flashcards';
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

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Text Analysis</h2>

      {/* Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Query (Ctrl+Enter to submit)
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введіть запит для аналізу тексту..."
          className="w-full h-20 px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleProcess}
        disabled={loading || !query.trim()}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Processing...' : '✨ Analyze Text'}
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
              const parsedItems = parseFlashcardList(item.result);
              const hasList = parsedItems.length >= 2;
              const newItems = parsedItems.filter(
                (parsed) => !savedWords.has(parsed.word.trim().toLowerCase())
              );

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

                  {hasList && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Знайдено {parsedItems.length} слів
                        {newItems.length < parsedItems.length &&
                          ` · нових: ${newItems.length}`}
                        {parsedItems.length - newItems.length > 0 &&
                          ` · вже є: ${parsedItems.length - newItems.length}`}
                      </p>
                      <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
                        {parsedItems.map((parsed, index) => {
                          const exists = savedWords.has(
                            parsed.word.trim().toLowerCase()
                          );

                          return (
                            <li
                              key={`${parsed.word}-${index}`}
                              className="flex items-start justify-between gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <span className={exists ? 'opacity-60' : undefined}>
                                <strong>{parsed.word}</strong>
                                {parsed.translation && (
                                  <span className="text-green-700 dark:text-green-400">
                                    {' '}
                                    — {parsed.translation}
                                  </span>
                                )}
                                {exists && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    вже в картках
                                  </span>
                                )}
                              </span>
                              {onSaveToFlashcards && videoId && !exists && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSaveToFlashcards(
                                      parsed.word,
                                      parsed.example,
                                      parsed.translation
                                    )
                                  }
                                  className="shrink-0 text-amber-600 dark:text-amber-400 hover:underline text-xs"
                                >
                                  📇
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
                    {onSaveManyToFlashcards && videoId && hasList && (
                      <button
                        onClick={() => onSaveManyToFlashcards(parsedItems)}
                        disabled={newItems.length === 0}
                        className="px-4 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                      >
                        {newItems.length === parsedItems.length
                          ? `📇 Зберегти всі (${parsedItems.length})`
                          : `📇 Зберегти нові (${newItems.length})`}
                      </button>
                    )}
                    {onSaveToFlashcards && videoId && !hasList && (
                      <button
                        onClick={() => {
                          const single = parsedItems[0];
                          if (single) {
                            if (hasFlashcard(single.word)) return;
                            onSaveToFlashcards(
                              single.word,
                              single.example,
                              single.translation
                            );
                            return;
                          }
                          onSaveToFlashcards('', item.result);
                        }}
                        disabled={
                          parsedItems[0]
                            ? hasFlashcard(parsedItems[0].word)
                            : false
                        }
                        className="px-4 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {parsedItems[0] && hasFlashcard(parsedItems[0].word)
                          ? '✓ Вже в картках'
                          : '📇 Save to Flashcards'}
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
