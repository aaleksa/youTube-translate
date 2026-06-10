'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useDebouncedCardEnrichment } from '../hooks/useDebouncedCardEnrichment';
import { isAutoEnrichNewCardsEnabled } from '../lib/flashcardSettings';
import {
  schedulePostSaveEnrichment,
  type CardEnrichmentResult,
} from '../lib/flashcardEnrichment';
import {
  addFlashcard,
  hasFlashcard,
  normalizeTags,
  type FlashcardDraft,
  type FlashcardSentenceContext,
} from '../lib/flashcards';
import { useI18n } from './InterfaceLanguageProvider';

interface SaveFlashcardModalProps {
  draft: FlashcardDraft | null;
  sentenceContext?: FlashcardSentenceContext;
  transcript?: string;
  onClose: () => void;
  onSaved: () => void;
}

function mergeEnrichmentTags(
  existing: string[],
  enrichment: CardEnrichmentResult | null
): string[] {
  if (!enrichment) return existing;
  return normalizeTags([
    ...existing,
    ...(enrichment.tags ?? []),
    ...(enrichment.partOfSpeech ? [enrichment.partOfSpeech] : []),
  ]);
}

export default function SaveFlashcardModal({
  draft,
  sentenceContext,
  transcript,
  onClose,
  onSaved,
}: SaveFlashcardModalProps) {
  const { t, translationLanguage } = useI18n();
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [level, setLevel] = useState('');
  const [ipa, setIpa] = useState('');
  const [error, setError] = useState('');
  const [autoEnrichEnabled, setAutoEnrichEnabled] = useState(true);

  useEffect(() => {
    setAutoEnrichEnabled(isAutoEnrichNewCardsEnabled());
  }, []);

  const originalExample = useMemo(() => {
    if (!draft) return '';
    return (draft.originalExample ?? draft.example)?.trim() ?? '';
  }, [draft]);

  const {
    loading,
    enrichment,
    error: enrichError,
    runEnrichment,
    markTranslationTouched,
    markExampleTouched,
    translationTouchedRef,
    exampleTouchedRef,
    resetTouched,
    clearEnrichment,
  } = useDebouncedCardEnrichment({
    word,
    translationLanguage,
    transcript,
    originalExample: originalExample || undefined,
    enabled: Boolean(draft),
    autoEnrichEnabled,
  });

  useEffect(() => {
    if (!draft) return;
    setWord(draft.word);
    setTranslation(draft.translation);
    setExample(draft.example);
    setTags(draft.tags ?? []);
    setExplanation(draft.explanation ?? '');
    setLevel(draft.level ?? '');
    setIpa(draft.ipa ?? '');
    setError('');
    resetTouched();
    clearEnrichment();
  }, [draft, resetTouched, clearEnrichment]);

  useEffect(() => {
    if (!enrichment) return;

    if (enrichment.translation) {
      setTranslation((current) => {
        if (current.trim() || translationTouchedRef.current) return current;
        return enrichment.translation ?? current;
      });
    }

    if (enrichment.example && !originalExample) {
      setExample((current) => {
        if (current.trim() || exampleTouchedRef.current) return current;
        return enrichment.example ?? current;
      });
    }

    if (enrichment.explanation) {
      setExplanation((current) => current.trim() || enrichment.explanation || '');
    }

    if (enrichment.level) {
      setLevel((current) => current || enrichment.level || '');
    }

    if (enrichment.ipa) {
      setIpa((current) => current.trim() || enrichment.ipa || '');
    }

    setTags((current) => mergeEnrichmentTags(current, enrichment));
  }, [enrichment, originalExample, translationTouchedRef, exampleTouchedRef]);

  if (!draft) return null;

  const isDuplicate = Boolean(word.trim() && hasFlashcard(word));
  const showOriginalExample = Boolean(originalExample);
  const isEnrichingTranslation = loading.translation;
  const isEnrichingExample = loading.example && !showOriginalExample;

  const handleRegenerateTranslation = async () => {
    const result = await runEnrichment(['translation', 'metadata'], word);
    if (result?.translation) {
      setTranslation(result.translation);
      if (result.explanation) setExplanation(result.explanation);
      if (result.level) setLevel(result.level);
      if (result.ipa) setIpa(result.ipa);
      setTags((current) => mergeEnrichmentTags(current, result));
    }
  };

  const handleRegenerateExample = async () => {
    if (showOriginalExample) return;
    const result = await runEnrichment(['example'], word);
    if (result?.example) setExample(result.example);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedWord = word.trim();
    const trimmedExample = (showOriginalExample ? originalExample : example).trim();
    const trimmedTranslation = translation.trim();

    if (!trimmedWord) {
      setError(t('enrichment.errorEmptyWord'));
      return;
    }

    if (hasFlashcard(trimmedWord)) {
      setError(t('enrichment.errorDuplicate'));
      return;
    }

    const hasTranslation = Boolean(trimmedTranslation);
    const saved = addFlashcard(
      {
        word: trimmedWord,
        translation: trimmedTranslation || trimmedExample || trimmedWord,
        example: trimmedExample || trimmedTranslation || trimmedWord,
        originalExample: showOriginalExample ? originalExample : undefined,
        tags,
        explanation: explanation.trim() || undefined,
        level: (level as FlashcardDraft['level']) || undefined,
        ipa: ipa.trim() || undefined,
        synonyms: enrichment?.synonyms,
        partOfSpeech: enrichment?.partOfSpeech,
        enrichmentStatus: hasTranslation ? 'completed' : 'pending',
        videoId: draft.videoId,
        videoUrl: draft.videoUrl,
        videoTitle: draft.videoTitle,
        timestamp: draft.timestamp,
      },
      sentenceContext
    );

    if (!saved) {
      setError(t('enrichment.errorDuplicate'));
      return;
    }

    if (
      autoEnrichEnabled &&
      (!hasTranslation || saved.enrichmentStatus === 'pending')
    ) {
      schedulePostSaveEnrichment(saved.id, { transcript });
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/50">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t('enrichment.saveTitle')}
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
              placeholder="e.g. give up"
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
                disabled={isEnrichingTranslation || !word.trim()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {t('enrichment.regenerateTranslation')}
              </button>
            </div>
            {isEnrichingTranslation ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('enrichment.generating')}
              </p>
            ) : null}
            <input
              type="text"
              value={translation}
              onChange={(e) => {
                markTranslationTouched();
                setTranslation(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('flashcards.editExample')}
              </label>
              {!showOriginalExample && (
                <button
                  type="button"
                  onClick={() => void handleRegenerateExample()}
                  disabled={isEnrichingExample || !word.trim()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {t('enrichment.regenerateExample')}
                </button>
              )}
            </div>
            {showOriginalExample && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                {t('enrichment.fromSubtitles')}
              </p>
            )}
            {isEnrichingExample ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('enrichment.generating')}
              </p>
            ) : null}
            <textarea
              value={showOriginalExample ? originalExample : example}
              onChange={(e) => {
                if (showOriginalExample) return;
                markExampleTouched();
                setExample(e.target.value);
              }}
              readOnly={showOriginalExample}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:opacity-90"
            />
          </div>

          {(explanation || level || ipa || tags.length > 0) && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 text-sm">
              {explanation && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t('enrichment.explanation')}: </span>
                  {explanation}
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
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('enrichment.source')}:{' '}
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
              {t('enrichment.errorDuplicate')}
            </p>
          )}

          {(error || enrichError) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error || enrichError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isDuplicate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              {t('flashcards.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              {t('flashcards.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
