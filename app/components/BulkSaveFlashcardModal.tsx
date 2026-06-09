'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  addFlashcards,
  hasFlashcard,
  type FlashcardDraft,
} from '../lib/flashcards';
import type { ParsedFlashcardItem } from '../lib/parseFlashcardList';

interface BulkSaveFlashcardModalProps {
  items: ParsedFlashcardItem[] | null;
  videoId: string;
  videoUrl: string;
  onClose: () => void;
  onSaved: (count: number) => void;
}

interface EditableItem extends ParsedFlashcardItem {
  selected: boolean;
  alreadyExists: boolean;
}

export default function BulkSaveFlashcardModal({
  items,
  videoId,
  videoUrl,
  onClose,
  onSaved,
}: BulkSaveFlashcardModalProps) {
  const [rows, setRows] = useState<EditableItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!items) return;
    setRows(
      items.map((item) => {
        const alreadyExists = hasFlashcard(item.word);
        return {
          ...item,
          alreadyExists,
          selected: !alreadyExists,
        };
      })
    );
    setError('');
  }, [items]);

  if (!items || rows.length === 0) return null;

  const existingCount = rows.filter((row) => row.alreadyExists).length;
  const newCount = rows.length - existingCount;
  const selectedCount = rows.filter((row) => row.selected).length;
  const selectedNewCount = rows.filter(
    (row) => row.selected && !row.alreadyExists
  ).length;

  const updateRow = (index: number, patch: Partial<EditableItem>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const toggleAll = (selected: boolean) => {
    setRows((prev) => prev.map((row) => ({ ...row, selected })));
  };

  const selectOnlyNew = () => {
    setRows((prev) =>
      prev.map((row) => ({ ...row, selected: !row.alreadyExists }))
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const toSave = rows.filter((row) => row.selected);

    if (toSave.length === 0) {
      setError('Оберіть хоча б одне слово');
      return;
    }

    const invalidIndex = toSave.findIndex((row) => !row.word.trim());
    if (invalidIndex !== -1) {
      setError(`Рядок #${invalidIndex + 1}: заповніть слово`);
      return;
    }

    const drafts: FlashcardDraft[] = toSave
      .filter((row) => !hasFlashcard(row.word))
      .map((row) => {
        const word = row.word.trim();
        const example = row.example.trim();
        const translation = row.translation.trim() || example || word;

        return {
          word,
          translation,
          example: example || translation || word,
          videoId,
          videoUrl,
        };
      });

    if (drafts.length === 0) {
      setError('Усі обрані слова вже є в картках');
      return;
    }

    const { added, skipped } = addFlashcards(drafts);
    if (added.length === 0) {
      setError('Усі обрані слова вже є в картках');
      return;
    }

    if (skipped.length > 0) {
      setError(`Збережено ${added.length}. Пропущено дублікатів: ${skipped.length}`);
    }

    onSaved(added.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/50">
      <div className="w-full max-w-3xl max-h-[90dvh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Зберегти список у Flashcards
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedCount} з {rows.length} обрано · нових: {newCount}
            {existingCount > 0 && ` · вже є: ${existingCount}`} · джерело:{' '}
            {videoId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="px-6 py-3 flex gap-2 border-b border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Обрати всі
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Зняти всі
            </button>
            {existingCount > 0 && (
              <button
                type="button"
                onClick={selectOnlyNew}
                className="text-sm text-amber-700 dark:text-amber-300 hover:underline"
              >
                Лише нові
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
            {rows.map((row, index) => (
              <div
                key={`${row.word}-${index}`}
                className={`p-3 rounded-lg border ${
                  row.alreadyExists
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/80'
                    : row.selected
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-70'
                }`}
              >
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={(e) =>
                      updateRow(index, { selected: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    #{index + 1}
                  </span>
                  {row.alreadyExists && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Вже в картках
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Слово *
                    </span>
                    <input
                      type="text"
                      value={row.word}
                      onChange={(e) => {
                        const nextWord = e.target.value;
                        updateRow(index, {
                          word: nextWord,
                          alreadyExists: hasFlashcard(nextWord),
                        });
                      }}
                      placeholder="give up"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Переклад
                    </span>
                    <input
                      type="text"
                      value={row.translation}
                      onChange={(e) =>
                        updateRow(index, { translation: e.target.value })
                      }
                      placeholder="здаватися"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Приклад
                    </span>
                    <input
                      type="text"
                      value={row.example}
                      onChange={(e) =>
                        updateRow(index, { example: e.target.value })
                      }
                      placeholder="I will never give up."
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="px-6 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
            >
              Зберегти обрані ({selectedNewCount || selectedCount})
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
