'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  clearBilingualCache,
  getBilingualCache,
  setBilingualCache,
} from '../lib/bilingualCache';
import { translateAllLines } from '../lib/translateLines';
import {
  findExampleLine,
  getFlashcardWordSet,
  hasFlashcard,
} from '../lib/flashcards';
import type { ParsedFlashcardItem } from '../lib/parseFlashcardList';
import { prepareFlashcardForWord } from '../lib/prepareFlashcards';
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
import { downloadSrtFile } from '../lib/exportSrt';
import { cleanTranscriptText } from '../lib/transcriptText';
import { formatTimestamp, parseTimestampToSeconds } from '../lib/timestamp';
import ToolbarMenu from './ToolbarMenu';
import VocabularyMenu from './VocabularyMenu';

interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptItem[];
  fullText: string;
  videoId: string;
  activeLineIndex?: number;
  onSeek?: (seconds: number, lineIndex: number) => void;
  onSaveToFlashcards?: (
    word: string,
    example: string,
    translation?: string
  ) => void;
  onSaveManyToFlashcards?: (items: ParsedFlashcardItem[]) => void;
  flashcardsRefreshKey?: number;
}

function lineClassName(isActive: boolean, canSeek: boolean): string {
  if (isActive) {
    return 'bg-blue-200/90 dark:bg-blue-900/70 ring-2 ring-blue-500 dark:ring-blue-400 shadow-sm';
  }
  if (canSeek) {
    return 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-800';
  }
  return 'hover:bg-gray-200 dark:hover:bg-gray-800';
}

function TranscriptLine({
  item,
  lineIndex,
  isActive,
  onSeek,
  lineRef,
}: {
  item: TranscriptItem;
  lineIndex: number;
  isActive: boolean;
  onSeek?: (seconds: number, lineIndex: number) => void;
  lineRef?: (el: HTMLDivElement | null) => void;
}) {
  const canSeek = Boolean(item.start && onSeek);

  const handleClick = () => {
    const selection = window.getSelection()?.toString();
    if (selection?.trim()) return;
    if (!item.start || !onSeek) return;
    onSeek(parseTimestampToSeconds(item.start), lineIndex);
  };

  return (
    <div
      ref={lineRef}
      role={canSeek ? 'button' : undefined}
      tabIndex={canSeek ? 0 : undefined}
      onClick={canSeek ? handleClick : undefined}
      onKeyDown={
        canSeek
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={`text-gray-700 dark:text-gray-300 leading-relaxed p-2 rounded transition ${lineClassName(isActive, canSeek)}`}
      title={canSeek ? 'Jump to this moment in the video' : undefined}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-start gap-2">
        <span
          className={`text-xs font-bold whitespace-nowrap px-2 py-1 rounded shrink-0 ${
            isActive
              ? 'text-white bg-blue-600 dark:bg-blue-500'
              : 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-950'
          }`}
        >
          {formatTimestamp(item.start)}
        </span>
        <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
      </div>
    </div>
  );
}

function BilingualLine({
  item,
  translation,
  lineIndex,
  isActive,
  onSeek,
  lineRef,
}: {
  item: TranscriptItem;
  translation: string;
  lineIndex: number;
  isActive: boolean;
  onSeek?: (seconds: number, lineIndex: number) => void;
  lineRef?: (el: HTMLDivElement | null) => void;
}) {
  const canSeek = Boolean(item.start && onSeek);

  const handleClick = () => {
    const selection = window.getSelection()?.toString();
    if (selection?.trim()) return;
    if (!item.start || !onSeek) return;
    onSeek(parseTimestampToSeconds(item.start), lineIndex);
  };

  return (
    <div
      ref={lineRef}
      role={canSeek ? 'button' : undefined}
      tabIndex={canSeek ? 0 : undefined}
      onClick={canSeek ? handleClick : undefined}
      onKeyDown={
        canSeek
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={`grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 p-2 rounded transition border ${
        isActive
          ? 'bg-blue-200/90 dark:bg-blue-900/70 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400'
          : canSeek
            ? 'border-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800'
            : 'border-transparent'
      }`}
      title={canSeek ? 'Jump to this moment in the video' : undefined}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="min-w-0">
        <span
          className={`inline-block text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded mb-1 ${
            isActive
              ? 'text-white bg-blue-600 dark:bg-blue-500'
              : 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-950'
          }`}
        >
          {formatTimestamp(item.start)}
        </span>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
          {item.text}
        </p>
      </div>
      <div className="min-w-0 md:border-l md:dark:border-gray-700 md:pl-4">
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 md:hidden">
          Українською
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {translation || '—'}
        </p>
      </div>
    </div>
  );
}

export default function TranscriptDisplay({
  transcript,
  fullText,
  videoId,
  activeLineIndex = 0,
  onSeek,
  onSaveToFlashcards,
  onSaveManyToFlashcards,
  flashcardsRefreshKey = 0,
}: TranscriptDisplayProps) {
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const seekClickRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [translations, setTranslations] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ done: 0, total: 0 });
  const [translateError, setTranslateError] = useState('');
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
  const [phrasalVerbs, setPhrasalVerbs] = useState<PhrasalVerbItem[] | null>(
    null
  );
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
  const [collocations, setCollocations] = useState<CollocationItem[] | null>(
    null
  );
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
    const saved = localStorage.getItem('yoytube-auto-scroll');
    if (saved !== null) {
      setAutoScroll(saved === 'true');
    }
  }, []);

  useEffect(() => {
    setBilingualMode(false);
    setTranslations(null);
    setTranslateError('');
    setTranslateProgress({ done: 0, total: 0 });
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
    lineRefs.current.clear();
  }, [videoId, transcript.length]);

  useEffect(() => {
    if (!autoScroll && !seekClickRef.current) return;

    const container = scrollContainerRef.current;
    const activeLine = lineRefs.current.get(activeLineIndex);
    if (!container || !activeLine) return;

    const lineRect = activeLine.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = lineRect.top - containerRect.top + container.scrollTop;
    const targetTop =
      relativeTop - container.clientHeight / 2 + lineRect.height / 2;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });

    seekClickRef.current = false;
  }, [activeLineIndex, autoScroll]);

  const handleSeek = (seconds: number, lineIndex: number) => {
    seekClickRef.current = true;
    onSeek?.(seconds, lineIndex);
  };

  const toggleAutoScroll = () => {
    setAutoScroll((prev) => {
      const next = !prev;
      localStorage.setItem('yoytube-auto-scroll', String(next));
      return next;
    });
  };

  const setLineRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      lineRefs.current.set(index, el);
    } else {
      lineRefs.current.delete(index);
    }
  };

  const filteredIndices = transcript
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const ua = translations?.[index]?.toLowerCase() ?? '';
      return (
        item.text.toLowerCase().includes(term) || ua.includes(term)
      );
    });

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcript.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportSrt = () => {
    downloadSrtFile(transcript, `${videoId}.srt`);
  };

  const handleSelection = () => {
    const text = cleanTranscriptText(window.getSelection()?.toString() || '');
    setSelectedText(text);
    setSelectionError('');
  };

  const clearSelection = () => {
    setSelectedText('');
    setSelectionError('');
    window.getSelection()?.removeAllRanges();
  };

  const handleSaveSelection = async () => {
    if (!selectedText || !onSaveToFlashcards || hasFlashcard(selectedText)) return;

    setSavingSelection(true);
    setSelectionError('');

    try {
      const fallbackExample = findExampleLine(selectedText, transcript);
      const prepared = await prepareFlashcardForWord(
        selectedText,
        fullText,
        fallbackExample
      );

      onSaveToFlashcards(
        prepared.word,
        prepared.example,
        prepared.translation
      );
    } catch (error) {
      setSelectionError(
        error instanceof Error ? error.message : 'Не вдалося отримати переклад'
      );
    } finally {
      setSavingSelection(false);
    }
  };

  const selectedAlreadySaved = useMemo(
    () => Boolean(selectedText) && hasFlashcard(selectedText),
    [selectedText, flashcardsRefreshKey]
  );

  const loadTranslations = async () => {
    const lines = transcript.map((item) => item.text);
    const cached = getBilingualCache(videoId, lines.length);
    if (cached) {
      setTranslations(cached);
      return;
    }

    setTranslating(true);
    setTranslateError('');
    setTranslateProgress({ done: 0, total: lines.length });

    try {
      const result = await translateAllLines(lines, (done, total) => {
        setTranslateProgress({ done, total });
      });
      setTranslations(result);
      setBilingualCache(videoId, lines.length, result);
    } catch (error) {
      setTranslateError(
        error instanceof Error ? error.message : 'Failed to translate transcript'
      );
      setBilingualMode(false);
    } finally {
      setTranslating(false);
    }
  };

  const handleToggleBilingual = async () => {
    if (bilingualMode) {
      setBilingualMode(false);
      return;
    }

    setBilingualMode(true);
    if (!translations) {
      await loadTranslations();
    }
  };

  const handleRetranslate = async () => {
    clearBilingualCache(videoId);
    setTranslations(null);
    setBilingualMode(true);
    await loadTranslations();
  };

  const handleFindKeyVocabulary = async () => {
    setKeyVocabularyError('');
    setShowKeyVocabulary(true);

    const cached = getKeyVocabularyCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find key vocabulary');
      }

      const found: KeyVocabularyItem[] = data.vocabulary ?? [];
      setKeyVocabularyCache(videoId, fullText.length, found);
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

    const cached = getFrequentWordsCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find frequent words');
      }

      const found: FrequentWordItem[] = data.frequentWords ?? [];
      setFrequentWordsCache(videoId, fullText.length, found);
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

    const cached = getIdiomsCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find idioms');
      }

      const found: IdiomItem[] = data.idioms ?? [];
      setIdiomsCache(videoId, fullText.length, found);
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

    const cached = getPhrasalVerbsCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find phrasal verbs');
      }

      const found: PhrasalVerbItem[] = data.phrasalVerbs ?? [];
      setPhrasalVerbsCache(videoId, fullText.length, found);
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

    const cached = getUsefulPhrasesCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find useful phrases');
      }

      const found: UsefulPhraseItem[] = data.phrases ?? [];
      setUsefulPhrasesCache(videoId, fullText.length, found);
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

    const cached = getCollocationsCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find collocations');
      }

      const found: CollocationItem[] = data.collocations ?? [];
      setCollocationsCache(videoId, fullText.length, found);
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

    const cached = getSlangCache(videoId, fullText.length);
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
        body: JSON.stringify({ text: fullText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find slang');
      }

      const found: SlangItem[] = data.slang ?? [];
      setSlangCache(videoId, fullText.length, found);
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
    <div className="w-full space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Transcript</h2>

        {onSeek && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Клік по рядку перемотує відео. Увімкніть автоскрол, якщо хочете слідкувати за текстом під час відтворення.
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Пошук у транскрипті
          </label>
          <input
            type="search"
            placeholder="Слово або фраза — покаже лише відповідні рядки"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Показано {filteredIndices.length} з {transcript.length} рядків
            </p>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarMenu
              label={copied ? '✓ Export' : '📥 Export ▾'}
              active={copied}
              items={[
                {
                  id: 'copy',
                  label: copied ? '✓ Copied' : '📋 Copy text',
                  onClick: handleCopyText,
                },
                {
                  id: 'txt',
                  label: '📄 Download .txt',
                  onClick: handleDownloadText,
                },
                {
                  id: 'srt',
                  label: '🎬 Export .srt',
                  onClick: handleExportSrt,
                },
              ]}
            />
            <span
              className="hidden sm:block w-px h-5 bg-gray-300 dark:bg-gray-600"
              aria-hidden
            />
            <button
              type="button"
              onClick={toggleAutoScroll}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                autoScroll
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {autoScroll ? '📜 Scroll ON' : '📜 Scroll'}
            </button>
            <button
              type="button"
              onClick={handleToggleBilingual}
              disabled={translating}
              className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
                bilingualMode
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {translating
                ? `🌍 ${translateProgress.done}/${translateProgress.total}`
                : bilingualMode
                  ? '🌍 UA ON'
                  : '🌍 +UA'}
            </button>
            {bilingualMode && translations && !translating && (
              <button
                type="button"
                onClick={handleRetranslate}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
              >
                🔄
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-full sm:w-auto">
              Vocabulary:
            </span>
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
              {keyVocabularyLoading ? '⏳' : '📚 Key Words'}
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
              {frequentWordsLoading ? '⏳' : '📊 Frequent'}
            </button>
          <VocabularyMenu
            items={[
              {
                id: 'phrasal-verbs',
                label: '🔤 Phrasal Verbs',
                loading: phrasalVerbsLoading,
                active: showPhrasalVerbs,
                onClick: handleFindPhrasalVerbs,
              },
              {
                id: 'idioms',
                label: '💬 Idioms',
                loading: idiomsLoading,
                active: showIdioms,
                onClick: handleFindIdioms,
              },
              {
                id: 'useful-phrases',
                label: '💡 Useful Phrases',
                loading: usefulPhrasesLoading,
                active: showUsefulPhrases,
                onClick: handleFindUsefulPhrases,
              },
              {
                id: 'collocations',
                label: '🔗 Collocations',
                loading: collocationsLoading,
                active: showCollocations,
                onClick: handleFindCollocations,
              },
              {
                id: 'slang',
                label: '🔥 Slang',
                loading: slangLoading,
                active: showSlang,
                onClick: handleFindSlang,
              },
            ]}
          />
          </div>
        </div>

        {translateError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-400 rounded text-red-700 dark:text-red-300 text-sm">
            {translateError}
          </div>
        )}

        {showKeyVocabulary && (
          <div className="mb-4 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
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

            {keyVocabulary &&
              !keyVocabularyLoading &&
              keyVocabulary.length === 0 && (
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
                            onSaveToFlashcards(
                              item.word,
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

        {showFrequentWords && (
          <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
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
                            onSaveToFlashcards(
                              item.word,
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

        {showPhrasalVerbs && (
          <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
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
          <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
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
          <div className="mb-4 p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg">
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
                            onSaveToFlashcards(
                              item.idiom,
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

        {showUsefulPhrases && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
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
                            onSaveToFlashcards(
                              item.phrase,
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

        {showCollocations && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
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

        {selectedText && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-400 dark:border-yellow-500 rounded relative">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected:</p>
              <button
                type="button"
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg leading-none shrink-0"
                aria-label="Прибрати виділення"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-800 dark:text-gray-200 italic mb-3 pr-6">
              &quot;{selectedText}&quot;
            </p>
            {selectionError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                {selectionError}
              </p>
            )}
            {onSaveToFlashcards && (
              selectedAlreadySaved ? (
                <span className="inline-flex px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg font-medium">
                  ✓ Вже в картках
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveSelection}
                  disabled={savingSelection}
                  className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                >
                  {savingSelection
                    ? '⏳ Додаємо переклад...'
                    : '📇 Зберегти в Flashcards'}
                </button>
              )
            )}
          </div>
        )}

        {bilingualMode && translations && (
          <div className="hidden md:grid md:grid-cols-2 gap-4 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span>English</span>
            <span>Українська</span>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onMouseUp={handleSelection}
          className="h-[min(32rem,calc(100vh-14rem))] xl:h-[calc(100vh-12rem)] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
        >
          {translating ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Переклад транскрипту...</p>
              <p>
                {translateProgress.done} / {translateProgress.total} рядків
              </p>
            </div>
          ) : filteredIndices.length > 0 ? (
            <div className="space-y-2">
              {filteredIndices.map(({ item, index }) =>
                bilingualMode && translations ? (
                  <BilingualLine
                    key={`${item.start ?? 'line'}-${index}`}
                    item={item}
                    translation={translations[index] ?? ''}
                    lineIndex={index}
                    isActive={index === activeLineIndex}
                    onSeek={handleSeek}
                    lineRef={setLineRef(index)}
                  />
                ) : (
                  <TranscriptLine
                    key={`${item.start ?? 'line'}-${index}`}
                    item={item}
                    lineIndex={index}
                    isActive={index === activeLineIndex}
                    onSeek={handleSeek}
                    lineRef={setLineRef(index)}
                  />
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No results found</p>
          )}
        </div>

      </div>
    </div>
  );
}
