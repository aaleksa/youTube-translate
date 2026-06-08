'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  addFlashcard,
  hasFlashcard,
  type FlashcardDraft,
} from '../lib/flashcards';

interface SaveFlashcardModalProps {
  draft: FlashcardDraft | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SaveFlashcardModal({
  draft,
  onClose,
  onSaved,
}: SaveFlashcardModalProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!draft) return;
    setWord(draft.word);
    setTranslation(draft.translation);
    setExample(draft.example);
    setError('');
  }, [draft]);

  if (!draft) return null;

  const isDuplicate = Boolean(word.trim() && hasFlashcard(word));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedWord = word.trim();
    const trimmedExample = example.trim();
    const trimmedTranslation = translation.trim();

    if (!trimmedWord) {
      setError('Заповніть слово');
      return;
    }

    if (hasFlashcard(trimmedWord)) {
      setError('Це слово вже є у ваших картках');
      return;
    }

    const saved = addFlashcard({
      word: trimmedWord,
      translation: trimmedTranslation || trimmedExample || trimmedWord,
      example: trimmedExample || trimmedTranslation || trimmedWord,
      videoId: draft.videoId,
      videoUrl: draft.videoUrl,
    });

    if (!saved) {
      setError('Це слово вже є у ваших картках');
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Save to Flashcards
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Слово / phrasal verb
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. give up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Переклад
            </label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. здаватися"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Приклад
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Джерело:{' '}
            <a
              href={draft.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {draft.videoId}
            </a>
          </div>

          {isDuplicate && !error && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Це слово вже збережено у Flashcards.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isDuplicate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              Зберегти
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
