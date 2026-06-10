'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ENRICH_DEBOUNCE_MS,
  enrichCard,
  type CardEnrichmentResult,
  type EnrichmentField,
} from '../lib/flashcardEnrichment';
import type { TranslationLanguageCode } from '../lib/translationLanguages';

export type EnrichmentLoading = {
  translation: boolean;
  example: boolean;
  metadata: boolean;
};

const idleLoading: EnrichmentLoading = {
  translation: false,
  example: false,
  metadata: false,
};

export function useDebouncedCardEnrichment(options: {
  word: string;
  translationLanguage: TranslationLanguageCode;
  transcript?: string;
  originalExample?: string;
  enabled: boolean;
  autoEnrichEnabled: boolean;
}) {
  const [loading, setLoading] = useState<EnrichmentLoading>(idleLoading);
  const [enrichment, setEnrichment] = useState<CardEnrichmentResult | null>(
    null
  );
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const translationTouched = useRef(false);
  const exampleTouched = useRef(false);

  const runEnrichment = useCallback(
    async (fields: EnrichmentField[], wordOverride?: string) => {
      const targetWord = (wordOverride ?? options.word).trim();
      if (!targetWord) return null;

      const id = ++requestId.current;
      setLoading({
        translation: fields.includes('translation'),
        example: fields.includes('example'),
        metadata: fields.includes('metadata'),
      });
      setError('');

      try {
        const result = await enrichCard({
          word: targetWord,
          translationLanguage: options.translationLanguage,
          transcript: options.transcript,
          originalExample: options.originalExample,
          fields,
        });

        if (id !== requestId.current) return null;
        setEnrichment(result);
        return result;
      } catch (err) {
        if (id === requestId.current) {
          setError(
            err instanceof Error ? err.message : 'Failed to enrich flashcard'
          );
        }
        return null;
      } finally {
        if (id === requestId.current) {
          setLoading(idleLoading);
        }
      }
    },
    [
      options.word,
      options.translationLanguage,
      options.transcript,
      options.originalExample,
    ]
  );

  useEffect(() => {
    if (!options.enabled || !options.autoEnrichEnabled) return;

    const trimmed = options.word.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      const fields: EnrichmentField[] = ['translation', 'metadata'];
      if (!options.originalExample?.trim()) {
        fields.push('example');
      }
      void runEnrichment(fields);
    }, ENRICH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    options.word,
    options.originalExample,
    options.enabled,
    options.autoEnrichEnabled,
    runEnrichment,
  ]);

  const resetTouched = useCallback(() => {
    translationTouched.current = false;
    exampleTouched.current = false;
  }, []);

  const clearEnrichment = useCallback(() => {
    requestId.current += 1;
    setEnrichment(null);
    setError('');
    setLoading(idleLoading);
  }, []);

  return {
    loading,
    enrichment,
    error,
    runEnrichment,
    translationTouchedRef: translationTouched,
    exampleTouchedRef: exampleTouched,
    markTranslationTouched: () => {
      translationTouched.current = true;
    },
    markExampleTouched: () => {
      exampleTouched.current = true;
    },
    resetTouched,
    clearEnrichment,
  };
}
