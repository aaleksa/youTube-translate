'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  clearBilingualCache,
  getBilingualCache,
  setBilingualCache,
} from '../lib/bilingualCache';
import { translateAllLines } from '../lib/translateLines';
import { findExampleLine, hasFlashcard } from '../lib/flashcards';
import { prepareFlashcardForWord } from '../lib/prepareFlashcards';
import { cleanTranscriptText } from '../lib/transcriptText';
import { formatTimestamp, parseTimestampToSeconds } from '../lib/timestamp';

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

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {copied ? '✓ Copied' : 'Copy All Text'}
          </button>
          <button
            onClick={handleDownloadText}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Download Text
          </button>
          <button
            onClick={toggleAutoScroll}
            className={`px-4 py-2 rounded-lg transition ${
              autoScroll
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            {autoScroll ? '📜 Автоскрол ON' : '📜 Автоскрол OFF'}
          </button>
          <button
            onClick={handleToggleBilingual}
            disabled={translating}
            className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${
              bilingualMode
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {translating
              ? `🌍 ${translateProgress.done}/${translateProgress.total}...`
              : bilingualMode
                ? '🌍 Bilingual ON'
                : '🌍 Bilingual EN/UA'}
          </button>
          {bilingualMode && translations && !translating && (
            <button
              onClick={handleRetranslate}
              className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 transition"
            >
              🔄 Retranslate
            </button>
          )}
        </div>

        {translateError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-400 rounded text-red-700 dark:text-red-300 text-sm">
            {translateError}
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
