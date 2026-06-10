'use client';

import { useEffect, useMemo, useState } from 'react';
import { getFlashcardWordSet } from '../lib/flashcards';
import { getIdiomsCache, setIdiomsCache } from '../lib/idiomsCache';
import type { IdiomItem } from '../lib/idioms';
import {
  getKeyVocabularyCache,
  setKeyVocabularyCache,
} from '../lib/keyVocabularyCache';
import type { KeyVocabularyItem } from '../lib/keyVocabulary';
import {
  getFrequentWordsCache,
  setFrequentWordsCache,
} from '../lib/frequentWordsCache';
import type { FrequentWordItem } from '../lib/frequentWords';
import {
  getPhrasalVerbsCache,
  setPhrasalVerbsCache,
} from '../lib/phrasalVerbsCache';
import type { PhrasalVerbItem } from '../lib/phrasalVerbs';
import {
  getUsefulPhrasesCache,
  setUsefulPhrasesCache,
} from '../lib/usefulPhrasesCache';
import type { UsefulPhraseItem } from '../lib/usefulPhrases';
import {
  getCollocationsCache,
  setCollocationsCache,
} from '../lib/collocationsCache';
import type { CollocationItem } from '../lib/collocations';
import { getSlangCache, setSlangCache } from '../lib/slangCache';
import {
  getFormalityLabel,
  getFormalityStyle,
  type SlangItem,
} from '../lib/slang';
import type { ParsedFlashcardItem } from '../lib/parseFlashcardList';
import { useI18n } from './InterfaceLanguageProvider';
import VocabularyMenu from './VocabularyMenu';

interface VocabularyAnalysisProps {
  videoId: string;
  text: string;
  flashcardsRefreshKey?: number;
  onSaveToFlashcards?: (word: string, example: string, translation?: string) => void;
  onSaveManyToFlashcards?: (items: ParsedFlashcardItem[]) => void;
}

export default function VocabularyAnalysis({
  videoId,
  text,
  flashcardsRefreshKey = 0,
  onSaveToFlashcards,
  onSaveManyToFlashcards,
}: VocabularyAnalysisProps) {
  const { t, translationLanguage } = useI18n();
  const [keyVocabulary, setKeyVocabulary] = useState<KeyVocabularyItem[] | null>(
    null
  );
  const [keyVocabularyLoading, setKeyVocabularyLoading] = useState(false);
  const [keyVocabularyError, setKeyVocabularyError] = useState('');
  const [keyVocabularyFromCache, setKeyVocabularyFromCache] = useState(false);
  const [showKeyVocabulary, setShowKeyVocabulary] = useState(false);
  const [frequentWords, setFrequentWords] = useState<FrequentWordItem[] | null>(
    null
  );
  const [frequentWordsLoading, setFrequentWordsLoading] = useState(false);
  const [frequentWordsError, setFrequentWordsError] = useState('');
  const [frequentWordsFromCache, setFrequentWordsFromCache] = useState(false);
  const [showFrequentWords, setShowFrequentWords] = useState(false);
  const [idioms, setIdioms] = useState<IdiomItem[] | null>(null);
  const [idiomsLoading, setIdiomsLoading] = useState(false);
  const [idiomsError, setIdiomsError] = useState('');
  const [idiomsFromCache, setIdiomsFromCache] = useState(false);
  const [showIdioms, setShowIdioms] = useState(false);
  const [phrasalVerbs, setPhrasalVerbs] = useState<PhrasalVerbItem[] | null>(null);
  const [phrasalVerbsLoading, setPhrasalVerbsLoading] = useState(false);
  const [phrasalVerbsError, setPhrasalVerbsError] = useState('');
  const [phrasalVerbsFromCache, setPhrasalVerbsFromCache] = useState(false);
  const [showPhrasalVerbs, setShowPhrasalVerbs] = useState(false);
  const [usefulPhrases, setUsefulPhrases] = useState<UsefulPhraseItem[] | null>(
    null
  );
  const [usefulPhrasesLoading, setUsefulPhrasesLoading] = useState(false);
  const [usefulPhrasesError, setUsefulPhrasesError] = useState('');
  const [usefulPhrasesFromCache, setUsefulPhrasesFromCache] = useState(false);
  const [showUsefulPhrases, setShowUsefulPhrases] = useState(false);
  const [collocations, setCollocations] = useState<CollocationItem[] | null>(null);
  const [collocationsLoading, setCollocationsLoading] = useState(false);
  const [collocationsError, setCollocationsError] = useState('');
  const [collocationsFromCache, setCollocationsFromCache] = useState(false);
  const [showCollocations, setShowCollocations] = useState(false);
  const [slang, setSlang] = useState<SlangItem[] | null>(null);
  const [slangLoading, setSlangLoading] = useState(false);
  const [slangError, setSlangError] = useState('');
  const [slangFromCache, setSlangFromCache] = useState(false);
  const [showSlang, setShowSlang] = useState(false);

  const savedWords = useMemo(
    () => getFlashcardWordSet(),
    [flashcardsRefreshKey]
  );

  useEffect(() => {
    setKeyVocabulary(null);
    setKeyVocabularyFromCache(false);
    setKeyVocabularyError('');
    setFrequentWords(null);
    setFrequentWordsFromCache(false);
    setFrequentWordsError('');
    setIdioms(null);
    setIdiomsFromCache(false);
    setIdiomsError('');
    setPhrasalVerbs(null);
    setPhrasalVerbsFromCache(false);
    setPhrasalVerbsError('');
    setUsefulPhrases(null);
    setUsefulPhrasesFromCache(false);
    setUsefulPhrasesError('');
    setCollocations(null);
    setCollocationsFromCache(false);
    setCollocationsError('');
    setSlang(null);
    setSlangFromCache(false);
    setSlangError('');
  }, [translationLanguage, videoId]);

  const visibleKeyVocabulary = useMemo(() => {
    if (!keyVocabulary) return [];
    return keyVocabulary.filter(
      (item) => !savedWords.has(item.word.trim().toLowerCase())
    );
  }, [keyVocabulary, savedWords]);

  const savedKeyVocabularyCount = keyVocabulary
    ? keyVocabulary.length - visibleKeyVocabulary.length
    : 0;

  const visibleFrequentWords = useMemo(() => {
    if (!frequentWords) return [];
    return frequentWords.filter(
      (item) => !savedWords.has(item.word.trim().toLowerCase())
    );
  }, [frequentWords, savedWords]);

  const savedFrequentWordsCount = frequentWords
    ? frequentWords.length - visibleFrequentWords.length
    : 0;

  const visibleIdioms = useMemo(() => {
    if (!idioms) return [];
    return idioms.filter(
      (item) => !savedWords.has(item.idiom.trim().toLowerCase())
    );
  }, [idioms, savedWords]);

  const savedIdiomsCount = idioms ? idioms.length - visibleIdioms.length : 0;

  const visiblePhrasalVerbs = useMemo(() => {
    if (!phrasalVerbs) return [];
    return phrasalVerbs.filter(
      (item) => !savedWords.has(item.phrasalVerb.trim().toLowerCase())
    );
  }, [phrasalVerbs, savedWords]);

  const savedPhrasalVerbsCount = phrasalVerbs
    ? phrasalVerbs.length - visiblePhrasalVerbs.length
    : 0;

  const visibleUsefulPhrases = useMemo(() => {
    if (!usefulPhrases) return [];
    return usefulPhrases.filter(
      (item) => !savedWords.has(item.phrase.trim().toLowerCase())
    );
  }, [usefulPhrases, savedWords]);

  const savedUsefulPhrasesCount = usefulPhrases
    ? usefulPhrases.length - visibleUsefulPhrases.length
    : 0;

  const visibleCollocations = useMemo(() => {
    if (!collocations) return [];
    return collocations.filter(
      (item) => !savedWords.has(item.collocation.trim().toLowerCase())
    );
  }, [collocations, savedWords]);

  const savedCollocationsCount = collocations
    ? collocations.length - visibleCollocations.length
    : 0;

  const visibleSlang = useMemo(() => {
    if (!slang) return [];
    return slang.filter(
      (item) => !savedWords.has(item.expression.trim().toLowerCase())
    );
  }, [slang, savedWords]);

  const savedSlangCount = slang ? slang.length - visibleSlang.length : 0;

  useEffect(() => {
    setKeyVocabulary(null);
    setKeyVocabularyError('');
    setKeyVocabularyFromCache(false);
    setShowKeyVocabulary(false);
    setFrequentWords(null);
    setFrequentWordsError('');
    setFrequentWordsFromCache(false);
    setShowFrequentWords(false);
    setIdioms(null);
    setIdiomsError('');
    setIdiomsFromCache(false);
    setShowIdioms(false);
    setPhrasalVerbs(null);
    setPhrasalVerbsError('');
    setPhrasalVerbsFromCache(false);
    setShowPhrasalVerbs(false);
    setUsefulPhrases(null);
    setUsefulPhrasesError('');
    setUsefulPhrasesFromCache(false);
    setShowUsefulPhrases(false);
    setCollocations(null);
    setCollocationsError('');
    setCollocationsFromCache(false);
    setShowCollocations(false);
    setSlang(null);
    setSlangError('');
    setSlangFromCache(false);
    setShowSlang(false);
  }, [videoId, text.length]);

  const handleFindKeyVocabulary = async () => {
    setKeyVocabularyError('');
    setShowKeyVocabulary(true);

    const cached = getKeyVocabularyCache(videoId, text.length);
    if (cached) {
      setKeyVocabulary(cached);
      setKeyVocabularyFromCache(true);
      return;
    }

    setKeyVocabularyLoading(true);
    setKeyVocabularyFromCache(false);

    try {
      const response = await fetch('/api/find-key-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find key vocabulary');
      }

      const found: KeyVocabularyItem[] = data.vocabulary ?? [];
      setKeyVocabularyCache(videoId, text.length, found);
      setKeyVocabulary(found);
    } catch (error) {
      setKeyVocabularyError(
        error instanceof Error
          ? error.message
          : 'Помилка пошуку ключової лексики'
      );
      setKeyVocabulary(null);
    } finally {
      setKeyVocabularyLoading(false);
    }
  };

  const handleSaveAllKeyVocabulary = () => {
    if (!onSaveManyToFlashcards || visibleKeyVocabulary.length === 0) return;

    onSaveManyToFlashcards(
      visibleKeyVocabulary.map((item) => ({
        word: item.word,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindFrequentWords = async () => {
    setFrequentWordsError('');
    setShowFrequentWords(true);

    const cached = getFrequentWordsCache(videoId, text.length);
    if (cached) {
      setFrequentWords(cached);
      setFrequentWordsFromCache(true);
      return;
    }

    setFrequentWordsLoading(true);
    setFrequentWordsFromCache(false);

    try {
      const response = await fetch('/api/find-frequent-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find frequent words');
      }

      const found: FrequentWordItem[] = data.frequentWords ?? [];
      setFrequentWordsCache(videoId, text.length, found);
      setFrequentWords(found);
    } catch (error) {
      setFrequentWordsError(
        error instanceof Error
          ? error.message
          : 'Помилка підрахунку частих слів'
      );
      setFrequentWords(null);
    } finally {
      setFrequentWordsLoading(false);
    }
  };

  const handleSaveAllFrequentWords = () => {
    if (!onSaveManyToFlashcards || visibleFrequentWords.length === 0) return;

    onSaveManyToFlashcards(
      visibleFrequentWords.map((item) => ({
        word: item.word,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindIdioms = async () => {
    setIdiomsError('');
    setShowIdioms(true);

    const cached = getIdiomsCache(videoId, text.length, translationLanguage);
    if (cached) {
      setIdioms(cached);
      setIdiomsFromCache(true);
      return;
    }

    setIdiomsLoading(true);
    setIdiomsFromCache(false);

    try {
      const response = await fetch('/api/find-idioms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find idioms');
      }

      const found: IdiomItem[] = data.idioms ?? [];
      setIdiomsCache(videoId, text.length, found, translationLanguage);
      setIdioms(found);
    } catch (error) {
      setIdiomsError(
        error instanceof Error ? error.message : 'Помилка пошуку ідіом'
      );
      setIdioms(null);
    } finally {
      setIdiomsLoading(false);
    }
  };

  const handleSaveAllIdioms = () => {
    if (!onSaveManyToFlashcards || visibleIdioms.length === 0) return;

    onSaveManyToFlashcards(
      visibleIdioms.map((item) => ({
        word: item.idiom,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindPhrasalVerbs = async () => {
    setPhrasalVerbsError('');
    setShowPhrasalVerbs(true);

    const cached = getPhrasalVerbsCache(videoId, text.length);
    if (cached) {
      setPhrasalVerbs(cached);
      setPhrasalVerbsFromCache(true);
      return;
    }

    setPhrasalVerbsLoading(true);
    setPhrasalVerbsFromCache(false);

    try {
      const response = await fetch('/api/find-phrasal-verbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find phrasal verbs');
      }

      const found: PhrasalVerbItem[] = data.phrasalVerbs ?? [];
      setPhrasalVerbsCache(videoId, text.length, found);
      setPhrasalVerbs(found);
    } catch (error) {
      setPhrasalVerbsError(
        error instanceof Error
          ? error.message
          : 'Помилка пошуку фразових дієслів'
      );
      setPhrasalVerbs(null);
    } finally {
      setPhrasalVerbsLoading(false);
    }
  };

  const handleSaveAllPhrasalVerbs = () => {
    if (!onSaveManyToFlashcards || visiblePhrasalVerbs.length === 0) return;

    onSaveManyToFlashcards(
      visiblePhrasalVerbs.map((item) => ({
        word: item.phrasalVerb,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindUsefulPhrases = async () => {
    setUsefulPhrasesError('');
    setShowUsefulPhrases(true);

    const cached = getUsefulPhrasesCache(videoId, text.length);
    if (cached) {
      setUsefulPhrases(cached);
      setUsefulPhrasesFromCache(true);
      return;
    }

    setUsefulPhrasesLoading(true);
    setUsefulPhrasesFromCache(false);

    try {
      const response = await fetch('/api/find-useful-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find useful phrases');
      }

      const found: UsefulPhraseItem[] = data.phrases ?? [];
      setUsefulPhrasesCache(videoId, text.length, found);
      setUsefulPhrases(found);
    } catch (error) {
      setUsefulPhrasesError(
        error instanceof Error
          ? error.message
          : 'Помилка пошуку корисних фраз'
      );
      setUsefulPhrases(null);
    } finally {
      setUsefulPhrasesLoading(false);
    }
  };

  const handleSaveAllUsefulPhrases = () => {
    if (!onSaveManyToFlashcards || visibleUsefulPhrases.length === 0) return;

    onSaveManyToFlashcards(
      visibleUsefulPhrases.map((item) => ({
        word: item.phrase,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindCollocations = async () => {
    setCollocationsError('');
    setShowCollocations(true);

    const cached = getCollocationsCache(videoId, text.length);
    if (cached) {
      setCollocations(cached);
      setCollocationsFromCache(true);
      return;
    }

    setCollocationsLoading(true);
    setCollocationsFromCache(false);

    try {
      const response = await fetch('/api/find-collocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find collocations');
      }

      const found: CollocationItem[] = data.collocations ?? [];
      setCollocationsCache(videoId, text.length, found);
      setCollocations(found);
    } catch (error) {
      setCollocationsError(
        error instanceof Error ? error.message : 'Помилка пошуку колокацій'
      );
      setCollocations(null);
    } finally {
      setCollocationsLoading(false);
    }
  };

  const handleSaveAllCollocations = () => {
    if (!onSaveManyToFlashcards || visibleCollocations.length === 0) return;

    onSaveManyToFlashcards(
      visibleCollocations.map((item) => ({
        word: item.collocation,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  const handleFindSlang = async () => {
    setSlangError('');
    setShowSlang(true);

    const cached = getSlangCache(videoId, text.length);
    if (cached) {
      setSlang(cached);
      setSlangFromCache(true);
      return;
    }

    setSlangLoading(true);
    setSlangFromCache(false);

    try {
      const response = await fetch('/api/find-slang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, translationLanguage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find slang');
      }

      const found: SlangItem[] = data.slang ?? [];
      setSlangCache(videoId, text.length, found);
      setSlang(found);
    } catch (error) {
      setSlangError(
        error instanceof Error ? error.message : 'Помилка пошуку сленгу'
      );
      setSlang(null);
    } finally {
      setSlangLoading(false);
    }
  };

  const handleSaveAllSlang = () => {
    if (!onSaveManyToFlashcards || visibleSlang.length === 0) return;

    onSaveManyToFlashcards(
      visibleSlang.map((item) => ({
        word: item.expression,
        translation: item.meaning,
        example: item.example,
      }))
    );
  };

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleFindKeyVocabulary}
          disabled={keyVocabularyLoading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showKeyVocabulary
              ? 'bg-sky-500 text-white hover:bg-sky-600'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900'
          }`}
        >
          {keyVocabularyLoading ? t('common.loading') : t('actions.keyWords')}
        </button>
        <button
          type="button"
          onClick={handleFindFrequentWords}
          disabled={frequentWordsLoading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showFrequentWords
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900'
          }`}
        >
          {frequentWordsLoading ? t('common.loading') : t('actions.frequentWords')}
        </button>
        <VocabularyMenu
          items={[
            {
              id: 'phrasal-verbs',
              label: t('actions.findPhrasalVerbs'),
              loading: phrasalVerbsLoading,
              active: showPhrasalVerbs,
              onClick: handleFindPhrasalVerbs,
            },
            {
              id: 'idioms',
              label: t('actions.idioms'),
              loading: idiomsLoading,
              active: showIdioms,
              onClick: handleFindIdioms,
            },
            {
              id: 'useful-phrases',
              label: t('actions.usefulPhrases'),
              loading: usefulPhrasesLoading,
              active: showUsefulPhrases,
              onClick: handleFindUsefulPhrases,
            },
            {
              id: 'collocations',
              label: t('actions.collocations'),
              loading: collocationsLoading,
              active: showCollocations,
              onClick: handleFindCollocations,
            },
            {
              id: 'slang',
              label: t('actions.slang'),
              loading: slangLoading,
              active: showSlang,
              onClick: handleFindSlang,
            },
          ]}
        />
      </div>

      {showKeyVocabulary && (
        <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-200">
              Key Vocabulary
              {keyVocabulary && ` (${visibleKeyVocabulary.length})`}
              {savedKeyVocabularyCount > 0 && (
                <span className="ml-1 text-xs font-normal text-sky-500 dark:text-sky-400">
                  · в картках: {savedKeyVocabularyCount}
                </span>
              )}
              {keyVocabularyFromCache && (
                <span className="ml-2 text-xs font-normal text-sky-500 dark:text-sky-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowKeyVocabulary(false)}
              className="text-sky-400 hover:text-sky-600 dark:hover:text-sky-200 transition"
              aria-label="Закрити список ключової лексики"
            >
              ✕
            </button>
          </div>

          {keyVocabularyLoading && (
            <p className="text-sm text-sky-700 dark:text-sky-300">
              ⏳ AI витягує ключову лексику з транскрипту...
            </p>
          )}

          {keyVocabularyError && !keyVocabularyLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {keyVocabularyError}
            </p>
          )}

          {keyVocabulary && !keyVocabularyLoading && keyVocabulary.length === 0 && (
            <p className="text-sm text-sky-700 dark:text-sky-300">
              Ключову лексику не знайдено в цьому транскрипті.
            </p>
          )}

          {keyVocabulary &&
            !keyVocabularyLoading &&
            keyVocabulary.length > 0 &&
            visibleKeyVocabulary.length === 0 && (
              <p className="text-sm text-sky-700 dark:text-sky-300">
                Усі знайдені слова вже збережені в картках.
              </p>
            )}

          {visibleKeyVocabulary.length > 0 && !keyVocabularyLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllKeyVocabulary}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleKeyVocabulary.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleKeyVocabulary.map((item, index) => (
                  <li
                    key={`${item.word}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-sky-100 dark:border-sky-900"
                  >
                    <p className="font-bold text-sky-700 dark:text-sky-300">
                      {item.word}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(item.word, item.example, item.meaning)
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showFrequentWords && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              Frequent Words
              {frequentWords && ` (${visibleFrequentWords.length})`}
              {savedFrequentWordsCount > 0 && (
                <span className="ml-1 text-xs font-normal text-indigo-500 dark:text-indigo-400">
                  · в картках: {savedFrequentWordsCount}
                </span>
              )}
              {frequentWordsFromCache && (
                <span className="ml-2 text-xs font-normal text-indigo-500 dark:text-indigo-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowFrequentWords(false)}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition"
              aria-label="Закрити список частих слів"
            >
              ✕
            </button>
          </div>

          {frequentWordsLoading && (
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              ⏳ Підраховуємо частоту слів і додаємо переклад...
            </p>
          )}

          {frequentWordsError && !frequentWordsLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {frequentWordsError}
            </p>
          )}

          {frequentWords &&
            !frequentWordsLoading &&
            frequentWords.length === 0 && (
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Частих слів не знайдено в цьому транскрипті.
              </p>
            )}

          {frequentWords &&
            !frequentWordsLoading &&
            frequentWords.length > 0 &&
            visibleFrequentWords.length === 0 && (
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Усі знайдені слова вже збережені в картках.
              </p>
            )}

          {visibleFrequentWords.length > 0 && !frequentWordsLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllFrequentWords}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleFrequentWords.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleFrequentWords.map((item, index) => (
                  <li
                    key={`${item.word}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-indigo-100 dark:border-indigo-900"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-indigo-700 dark:text-indigo-300">
                        {item.word}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium">
                        {item.count}×
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(item.word, item.example, item.meaning)
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showPhrasalVerbs && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-200">
              Phrasal Verbs
              {phrasalVerbs && ` (${visiblePhrasalVerbs.length})`}
              {savedPhrasalVerbsCount > 0 && (
                <span className="ml-1 text-xs font-normal text-teal-500 dark:text-teal-400">
                  · в картках: {savedPhrasalVerbsCount}
                </span>
              )}
              {phrasalVerbsFromCache && (
                <span className="ml-2 text-xs font-normal text-teal-500 dark:text-teal-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowPhrasalVerbs(false)}
              className="text-teal-400 hover:text-teal-600 dark:hover:text-teal-200 transition"
              aria-label="Закрити список фразових дієслів"
            >
              ✕
            </button>
          </div>

          {phrasalVerbsLoading && (
            <p className="text-sm text-teal-700 dark:text-teal-300">
              ⏳ AI шукає фразові дієслова в транскрипті...
            </p>
          )}

          {phrasalVerbsError && !phrasalVerbsLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {phrasalVerbsError}
            </p>
          )}

          {phrasalVerbs && !phrasalVerbsLoading && phrasalVerbs.length === 0 && (
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Фразових дієслів не знайдено в цьому транскрипті.
            </p>
          )}

          {phrasalVerbs &&
            !phrasalVerbsLoading &&
            phrasalVerbs.length > 0 &&
            visiblePhrasalVerbs.length === 0 && (
              <p className="text-sm text-teal-700 dark:text-teal-300">
                Усі знайдені фразові дієслова вже збережені в картках.
              </p>
            )}

          {visiblePhrasalVerbs.length > 0 && !phrasalVerbsLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllPhrasalVerbs}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visiblePhrasalVerbs.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visiblePhrasalVerbs.map((item, index) => (
                  <li
                    key={`${item.phrasalVerb}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-teal-100 dark:border-teal-900"
                  >
                    <p className="font-bold text-teal-700 dark:text-teal-300">
                      {item.phrasalVerb}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(
                            item.phrasalVerb,
                            item.example,
                            item.meaning
                          )
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showSlang && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">
              Slang
              {slang && ` (${visibleSlang.length})`}
              {savedSlangCount > 0 && (
                <span className="ml-1 text-xs font-normal text-rose-500 dark:text-rose-400">
                  · в картках: {savedSlangCount}
                </span>
              )}
              {slangFromCache && (
                <span className="ml-2 text-xs font-normal text-rose-500 dark:text-rose-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowSlang(false)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition"
              aria-label="Закрити список сленгу"
            >
              ✕
            </button>
          </div>

          {slangLoading && (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              ⏳ AI шукає сленг у транскрипті...
            </p>
          )}

          {slangError && !slangLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">{slangError}</p>
          )}

          {slang && !slangLoading && slang.length === 0 && (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Сленгу не знайдено в цьому транскрипті.
            </p>
          )}

          {slang &&
            !slangLoading &&
            slang.length > 0 &&
            visibleSlang.length === 0 && (
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Усі знайдені вирази вже збережені в картках.
              </p>
            )}

          {visibleSlang.length > 0 && !slangLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllSlang}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleSlang.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleSlang.map((item, index) => (
                  <li
                    key={`${item.expression}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-rose-700 dark:text-rose-300">
                        {item.expression}
                      </p>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${getFormalityStyle(item.formality)}`}
                      >
                        {getFormalityLabel(item.formality)}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(
                            item.expression,
                            item.example,
                            item.meaning
                          )
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showIdioms && (
        <div className="p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-200">
              Idioms
              {idioms && ` (${visibleIdioms.length})`}
              {savedIdiomsCount > 0 && (
                <span className="ml-1 text-xs font-normal text-violet-500 dark:text-violet-400">
                  · в картках: {savedIdiomsCount}
                </span>
              )}
              {idiomsFromCache && (
                <span className="ml-2 text-xs font-normal text-violet-500 dark:text-violet-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowIdioms(false)}
              className="text-violet-400 hover:text-violet-600 dark:hover:text-violet-200 transition"
              aria-label="Закрити список ідіом"
            >
              ✕
            </button>
          </div>

          {idiomsLoading && (
            <p className="text-sm text-violet-700 dark:text-violet-300">
              ⏳ AI шукає ідіоми в транскрипті...
            </p>
          )}

          {idiomsError && !idiomsLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">{idiomsError}</p>
          )}

          {idioms && !idiomsLoading && idioms.length === 0 && (
            <p className="text-sm text-violet-700 dark:text-violet-300">
              Ідіом не знайдено в цьому транскрипті.
            </p>
          )}

          {idioms &&
            !idiomsLoading &&
            idioms.length > 0 &&
            visibleIdioms.length === 0 && (
              <p className="text-sm text-violet-700 dark:text-violet-300">
                Усі знайдені ідіоми вже збережені в картках.
              </p>
            )}

          {visibleIdioms.length > 0 && !idiomsLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllIdioms}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleIdioms.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleIdioms.map((item, index) => (
                  <li
                    key={`${item.idiom}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-violet-100 dark:border-violet-900"
                  >
                    <p className="font-bold text-violet-700 dark:text-violet-300">
                      {item.idiom}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(item.idiom, item.example, item.meaning)
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showUsefulPhrases && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Useful Phrases
              {usefulPhrases && ` (${visibleUsefulPhrases.length})`}
              {savedUsefulPhrasesCount > 0 && (
                <span className="ml-1 text-xs font-normal text-orange-500 dark:text-orange-400">
                  · в картках: {savedUsefulPhrasesCount}
                </span>
              )}
              {usefulPhrasesFromCache && (
                <span className="ml-2 text-xs font-normal text-orange-500 dark:text-orange-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowUsefulPhrases(false)}
              className="text-orange-400 hover:text-orange-600 dark:hover:text-orange-200 transition"
              aria-label="Закрити список корисних фраз"
            >
              ✕
            </button>
          </div>

          {usefulPhrasesLoading && (
            <p className="text-sm text-orange-700 dark:text-orange-300">
              ⏳ AI шукає корисні фрази в транскрипті...
            </p>
          )}

          {usefulPhrasesError && !usefulPhrasesLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {usefulPhrasesError}
            </p>
          )}

          {usefulPhrases &&
            !usefulPhrasesLoading &&
            usefulPhrases.length === 0 && (
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Корисних фраз не знайдено в цьому транскрипті.
              </p>
            )}

          {usefulPhrases &&
            !usefulPhrasesLoading &&
            usefulPhrases.length > 0 &&
            visibleUsefulPhrases.length === 0 && (
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Усі знайдені фрази вже збережені в картках.
              </p>
            )}

          {visibleUsefulPhrases.length > 0 && !usefulPhrasesLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllUsefulPhrases}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleUsefulPhrases.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleUsefulPhrases.map((item, index) => (
                  <li
                    key={`${item.phrase}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-orange-100 dark:border-orange-900"
                  >
                    <p className="font-bold text-orange-700 dark:text-orange-300">
                      {item.phrase}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(item.phrase, item.example, item.meaning)
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showCollocations && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Collocations
              {collocations && ` (${visibleCollocations.length})`}
              {savedCollocationsCount > 0 && (
                <span className="ml-1 text-xs font-normal text-emerald-500 dark:text-emerald-400">
                  · в картках: {savedCollocationsCount}
                </span>
              )}
              {collocationsFromCache && (
                <span className="ml-2 text-xs font-normal text-emerald-500 dark:text-emerald-400">
                  кеш
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setShowCollocations(false)}
              className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-200 transition"
              aria-label="Закрити список колокацій"
            >
              ✕
            </button>
          </div>

          {collocationsLoading && (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              ⏳ AI шукає колокації в транскрипті...
            </p>
          )}

          {collocationsError && !collocationsLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {collocationsError}
            </p>
          )}

          {collocations &&
            !collocationsLoading &&
            collocations.length === 0 && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Колокацій не знайдено в цьому транскрипті.
              </p>
            )}

          {collocations &&
            !collocationsLoading &&
            collocations.length > 0 &&
            visibleCollocations.length === 0 && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Усі знайдені колокації вже збережені в картках.
              </p>
            )}

          {visibleCollocations.length > 0 && !collocationsLoading && (
            <>
              {onSaveManyToFlashcards && (
                <button
                  type="button"
                  onClick={handleSaveAllCollocations}
                  className="mb-3 w-full px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  📇 Зберегти всі ({visibleCollocations.length})
                </button>
              )}
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {visibleCollocations.map((item, index) => (
                  <li
                    key={`${item.collocation}-${index}`}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-emerald-100 dark:border-emerald-900"
                  >
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">
                      {item.collocation}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {item.meaning}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      &quot;{item.example}&quot;
                    </p>
                    {onSaveToFlashcards && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToFlashcards(
                            item.collocation,
                            item.example,
                            item.meaning
                          )
                        }
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        📇 Зберегти
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
