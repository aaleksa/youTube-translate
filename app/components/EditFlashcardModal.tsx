'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import type { Deck } from '../lib/decks';
import { enrichAndSaveCard } from '../lib/flashcardEnrichment';
import {
  normalizeTags,
  updateFlashcard,
  type CefrLevel,
  type Flashcard,
  type UpdateFlashcardError,
} from '../lib/flashcards';
import { getFlashcardTranslation } from '../lib/flashcardTranslations';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

interface EditFlashcardModalProps {
  card: Flashcard | null;
  decks: Deck[];
  transcript?: string;
  onClose: () => void;
  onSaved: (card: Flashcard) => void;
}

function errorMessage(
  error: UpdateFlashcardError,
  t: (key: TranslationKey) => string
): string {
  switch (error) {
    case 'empty_word':
      return t('flashcards.editErrorEmptyWord');
    case 'duplicate_word':
      return t('flashcards.editErrorDuplicate');
    case 'not_found':
      return t('flashcards.editErrorNotFound');
  }
}

export default function EditFlashcardModal({
  card,
  decks,
  transcript,
  onClose,
  onSaved,
}: EditFlashcardModalProps) {
  const { t, translationLanguage } = useI18n();
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [deckIds, setDeckIds] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [level, setLevel] = useState<CefrLevel | ''>('');
  const [ipa, setIpa] = useState('');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState<'translation' | 'example' | null>(
    null
  );

  useEffect(() => {
    if (!card) return;
    setWord(card.word);
    setTranslation(getFlashcardTranslation(card, translationLanguage));
    setExample(card.example);
    setTags(card.tags);
    setTagInput('');
    setDeckIds(card.deckIds);
    setExplanation(card.explanation ?? '');
    setPartOfSpeech(card.partOfSpeech ?? '');
    setLevel(card.level ?? '');
    setIpa(card.ipa ?? '');
    setSynonyms(card.synonyms ?? []);
    setError('');
  }, [card, translationLanguage]);

  if (!card) return null;

  const canRestoreOriginal =
    Boolean(card.originalExample) &&
    card.originalExample !== example.trim();

  const hasOriginalExample = Boolean(card.originalExample?.trim());

  const applyCard = (updated: Flashcard) => {
    setTranslation(getFlashcardTranslation(updated, translationLanguage));
    setExample(updated.example);
    setTags(updated.tags);
    setExplanation(updated.explanation ?? '');
    setPartOfSpeech(updated.partOfSpeech ?? '');
    setLevel(updated.level ?? '');
    setIpa(updated.ipa ?? '');
    setSynonyms(updated.synonyms ?? []);
    onSaved(updated);
  };

  const handleRegenerateTranslation = async () => {
    setRegenerating('translation');
    setError('');
    try {
      const updated = await enrichAndSaveCard(card.id, {
        transcript,
        fields: ['translation', 'metadata'],
        forceTranslation: true,
      });
      if (updated) applyCard(updated);
    } catch {
      setError(t('enrichment.failed'));
    } finally {
      setRegenerating(null);
    }
  };

  const handleRegenerateExample = async () => {
    if (hasOriginalExample) return;
    setRegenerating('example');
    setError('');
    try {
      const updated = await enrichAndSaveCard(card.id, {
        transcript,
        fields: ['example'],
        forceExample: true,
      });
      if (updated) applyCard(updated);
    } catch {
      setError(t('enrichment.failed'));
    } finally {
      setRegenerating(null);
    }
  };

  const addTag = (raw: string) => {
    const next = normalizeTags([...tags, raw]);
    setTags(next);
    setTagInput('');
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (event.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const toggleDeck = (deckId: string) => {
    setDeckIds((current) =>
      current.includes(deckId)
        ? current.filter((id) => id !== deckId)
        : [...current, deckId]
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = updateFlashcard({
      id: card.id,
      word,
      translation,
      example,
      tags,
      deckIds,
      explanation: explanation.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || undefined,
      level: level || undefined,
      ipa: ipa.trim() || undefined,
      synonyms: synonyms.length > 0 ? synonyms : undefined,
    });

    if (!result.ok) {
      setError(errorMessage(result.error, t));
      return;
    }

    onSaved(result.card);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/50">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t('flashcards.editTitle')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('flashcards.editWord')}
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('flashcards.editTranslation')}
              </label>
              <button
                type="button"
                onClick={() => void handleRegenerateTranslation()}
                disabled={regenerating === 'translation'}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {regenerating === 'translation'
                  ? t('enrichment.generating')
                  : t('enrichment.regenerateTranslation')}
              </button>
            </div>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('flashcards.editExample')}
              </label>
              <div className="flex items-center gap-2">
                {canRestoreOriginal && (
                  <button
                    type="button"
                    onClick={() => setExample(card.originalExample ?? '')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('flashcards.restoreOriginal')}
                  </button>
                )}
                {!hasOriginalExample && (
                  <button
                    type="button"
                    onClick={() => void handleRegenerateExample()}
                    disabled={regenerating === 'example'}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {regenerating === 'example'
                      ? t('enrichment.generating')
                      : t('enrichment.regenerateExample')}
                  </button>
                )}
              </div>
            </div>
            {hasOriginalExample && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                {t('enrichment.fromSubtitles')}
              </p>
            )}
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(explanation || partOfSpeech || level || ipa || synonyms.length > 0) && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 text-sm">
              {explanation && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t('enrichment.explanation')}: </span>
                  {explanation}
                </p>
              )}
              {partOfSpeech && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t('enrichment.partOfSpeech')}: </span>
                  {partOfSpeech}
                </p>
              )}
              {level && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">CEFR: </span>
                  {level}
                </p>
              )}
              {ipa && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">IPA: </span>
                  {ipa}
                </p>
              )}
              {synonyms.length > 0 && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t('enrichment.synonyms')}: </span>
                  {synonyms.join(', ')}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('flashcards.editTags')}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-xs text-gray-800 dark:text-gray-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((item) => item !== tag))}
                    className="hover:text-red-600"
                    aria-label={t('flashcards.removeTag', { tag })}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) addTag(tagInput);
                }}
                placeholder={tags.length === 0 ? t('flashcards.tagPlaceholder') : ''}
                className="flex-1 min-w-[8rem] bg-transparent text-sm text-gray-800 dark:text-gray-100 outline-none"
              />
            </div>
          </div>

          {decks.length > 0 && (
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('flashcards.moveToDeck')}
              </legend>
              <div className="space-y-2 max-h-36 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                {decks.map((deck) => (
                  <label
                    key={deck.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={deckIds.includes(deck.id)}
                      onChange={() => toggleDeck(deck.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    {deck.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {card.videoId && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('flashcards.editVideoLocked')}:{' '}
              {card.videoTitle || card.videoId}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              {t('flashcards.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t('flashcards.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
