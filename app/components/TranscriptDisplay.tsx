'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearBilingualCache,
  getBilingualCache,
  setBilingualCache,
} from '../lib/bilingualCache';
import {
  TranslationCancelledError,
  translateAllLines,
} from '../lib/translateLines';
import {
  findExampleLine,
  getFlashcardWordSet,
  hasFlashcard,
} from '../lib/flashcards';
import { prepareFlashcardForWord } from '../lib/prepareFlashcards';
import { downloadSrtFile, downloadVttFile } from '../lib/exportSubtitles';
import {
  downloadStudyReportMarkdown,
  downloadStudyReportPdf,
  type StudyExportLabels,
} from '../lib/exportStudyReport';
import { cleanTranscriptText } from '../lib/transcriptText';
import { formatTimestamp, parseTimestampToSeconds } from '../lib/timestamp';
import SelectionAnalysis from './SelectionAnalysis';
import SelectionTranslate from './SelectionTranslate';
import SentenceExplanation from './SentenceExplanation';
import TranslationLanguageSelect from './TranslationLanguageSelect';
import ToolbarMenu from './ToolbarMenu';
import {
  DEFAULT_TRANSLATION_LANGUAGE,
  getTranslationLanguageName,
  getTranslationLanguageShortCode,
  isTranslationLanguage,
  type TranslationLanguageCode,
} from '../lib/translationLanguages';
import {
  getSavedTranslationLanguage,
  saveTranslationLanguage,
} from '../lib/languageSettings';
import { useI18n } from './InterfaceLanguageProvider';

interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptItem[];
  fullText: string;
  videoId: string;
  videoTitle?: string;
  videoUrl?: string;
  activeLineIndex?: number;
  shadowingLineIndex?: number | null;
  isPlaying?: boolean;
  onSeek?: (seconds: number, lineIndex: number) => void;
  onSaveToFlashcards?: (
    word: string,
    example: string,
    translation?: string
  ) => void;
  flashcardsRefreshKey?: number;
  onPauseVideo?: () => void;
  onShadowingClick?: () => void;
}

function countSelectionWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function lineClassName(
  isActive: boolean,
  canSeek: boolean,
  isShadowing = false
): string {
  if (isActive) {
    if (isShadowing) {
      return 'bg-violet-50 dark:bg-violet-950/50 border-l-[3px] border-l-violet-500 dark:border-l-violet-400 ring-1 ring-inset ring-violet-200/80 dark:ring-violet-700/60 shadow-sm';
    }
    return 'bg-blue-50 dark:bg-blue-950/50 border-l-[3px] border-l-blue-500 dark:border-l-blue-400 ring-1 ring-inset ring-blue-200/80 dark:ring-blue-700/60 shadow-sm';
  }
  if (canSeek) {
    return 'border-l-[3px] border-l-transparent cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/60';
  }
  return 'border-l-[3px] border-l-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/40';
}

function TranscriptLine({
  item,
  lineIndex,
  isActive,
  isShadowing = false,
  onSeek,
  lineRef,
  seekTitle,
}: {
  item: TranscriptItem;
  lineIndex: number;
  isActive: boolean;
  isShadowing?: boolean;
  onSeek?: (seconds: number, lineIndex: number) => void;
  lineRef?: (el: HTMLDivElement | null) => void;
  seekTitle: string;
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
      className={`text-gray-800 dark:text-gray-200 leading-relaxed py-2.5 px-3 rounded-r-md transition ${lineClassName(isActive, canSeek, isShadowing)}`}
      title={canSeek ? seekTitle : undefined}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-start gap-2">
        <span
          className={`text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded shrink-0 ${
            isActive
              ? isShadowing
                ? 'text-violet-700 dark:text-violet-200 bg-violet-100 dark:bg-violet-900/60'
                : 'text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/60'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatTimestamp(item.start)}
        </span>
        <span
          className={`text-[15px] flex-1 ${isActive ? 'font-medium text-gray-900 dark:text-gray-50' : ''}`}
        >
          {item.text}
        </span>
      </div>
    </div>
  );
}

function BilingualLine({
  item,
  translation,
  lineIndex,
  isActive,
  isShadowing = false,
  onSeek,
  lineRef,
  seekTitle,
}: {
  item: TranscriptItem;
  translation: string;
  lineIndex: number;
  isActive: boolean;
  isShadowing?: boolean;
  onSeek?: (seconds: number, lineIndex: number) => void;
  lineRef?: (el: HTMLDivElement | null) => void;
  seekTitle: string;
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
      className={`grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 min-[480px]:gap-3 sm:gap-5 items-stretch py-2.5 px-3 rounded-r-md transition border-l-[3px] ${
        isActive
          ? isShadowing
            ? 'bg-violet-50 dark:bg-violet-950/50 border-l-violet-500 dark:border-l-violet-400 ring-1 ring-inset ring-violet-200/80 dark:ring-violet-700/60 shadow-sm'
            : 'bg-blue-50 dark:bg-blue-950/50 border-l-blue-500 dark:border-l-blue-400 ring-1 ring-inset ring-blue-200/80 dark:ring-blue-700/60 shadow-sm'
          : canSeek
            ? 'border-l-transparent cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/60'
            : 'border-l-transparent'
      }`}
      title={canSeek ? seekTitle : undefined}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="min-w-0 flex flex-col justify-center min-[480px]:border-r border-gray-200 dark:border-gray-700 min-[480px]:pr-3 sm:pr-5">
        <span
          className={`inline-block w-fit text-[10px] sm:text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded mb-1 ${
            isActive
              ? isShadowing
                ? 'text-violet-700 dark:text-violet-200 bg-violet-100 dark:bg-violet-900/60'
                : 'text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/60'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatTimestamp(item.start)}
        </span>
        <p
          className={`text-sm sm:text-[15px] leading-relaxed ${
            isActive
              ? 'font-medium text-gray-900 dark:text-gray-50'
              : 'text-gray-800 dark:text-gray-200'
          }`}
        >
          {item.text}
        </p>
      </div>
      <div className="min-w-0 flex flex-col justify-center pl-1 sm:pl-0">
        <p
          className={`text-sm sm:text-[15px] leading-relaxed ${
            isActive
              ? 'text-gray-700 dark:text-gray-200'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
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
  videoTitle,
  videoUrl,
  activeLineIndex = 0,
  shadowingLineIndex = null,
  isPlaying = false,
  onSeek,
  onSaveToFlashcards,
  flashcardsRefreshKey = 0,
  onPauseVideo,
  onShadowingClick,
}: TranscriptDisplayProps) {
  const { t, language } = useI18n();
  const highlightLineIndex = shadowingLineIndex ?? activeLineIndex;
  const isShadowingMode = shadowingLineIndex !== null;
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const seekClickRef = useRef(false);
  const translateAbortRef = useRef<AbortController | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translationLanguage, setTranslationLanguage] =
    useState<TranslationLanguageCode>(DEFAULT_TRANSLATION_LANGUAGE);
  const [translations, setTranslations] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ done: 0, total: 0 });
  const [translateError, setTranslateError] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState('');

  const bilingualMode = translationEnabled;
  const translationLabel = getTranslationLanguageName(translationLanguage);
  const translationShortCode = getTranslationLanguageShortCode(translationLanguage);

  useEffect(() => {
    const saved = localStorage.getItem('yoytube-auto-scroll');
    if (saved !== null) {
      setAutoScroll(saved === 'true');
    }
    setTranslationLanguage(getSavedTranslationLanguage());
  }, []);

  const cancelTranslation = useCallback(() => {
    translateAbortRef.current?.abort();
    translateAbortRef.current = null;
    setTranslating(false);
    setTranslationEnabled(false);
    setTranslations(null);
    setTranslateProgress({ done: 0, total: 0 });
    setTranslateError('');
  }, []);

  const loadTranslations = useCallback(
    async (targetLanguage: TranslationLanguageCode) => {
      const lines = transcript.map((item) => item.text);
      const cached = getBilingualCache(videoId, lines.length, targetLanguage);
      if (cached) {
        setTranslations(cached);
        return;
      }

      translateAbortRef.current?.abort();
      const controller = new AbortController();
      translateAbortRef.current = controller;

      setTranslating(true);
      setTranslateError('');
      setTranslateProgress({ done: 0, total: lines.length });

      try {
        const result = await translateAllLines(
          lines,
          targetLanguage,
          (done, total) => {
            setTranslateProgress({ done, total });
          },
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setTranslations(result);
        setBilingualCache(videoId, lines.length, targetLanguage, result);
      } catch (error) {
        if (
          error instanceof TranslationCancelledError ||
          (error instanceof DOMException && error.name === 'AbortError')
        ) {
          return;
        }

        setTranslateError(
          error instanceof Error ? error.message : 'Failed to translate transcript'
        );
        setTranslations(null);
        setTranslationEnabled(false);
      } finally {
        if (translateAbortRef.current === controller) {
          translateAbortRef.current = null;
        }
        if (!controller.signal.aborted) {
          setTranslating(false);
        }
      }
    },
    [transcript, videoId]
  );

  useEffect(() => {
    translateAbortRef.current?.abort();
    translateAbortRef.current = null;
    setTranslationEnabled(false);
    setTranslations(null);
    setTranslateError('');
    setTranslateProgress({ done: 0, total: 0 });
    setTranslating(false);
    lineRefs.current.clear();
  }, [videoId, transcript.length]);

  useEffect(() => {
    return () => {
      translateAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const shouldScroll =
      seekClickRef.current || isShadowingMode || (autoScroll && isPlaying);
    if (!shouldScroll) return;

    const container = scrollContainerRef.current;
    const activeLine = lineRefs.current.get(highlightLineIndex);
    if (!container || !activeLine) return;

    const lineRect = activeLine.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const edgePadding = 56;
    const isFullyVisible =
      lineRect.top >= containerRect.top + edgePadding &&
      lineRect.bottom <= containerRect.bottom - edgePadding;

    if (!seekClickRef.current && isFullyVisible) return;

    const relativeTop = lineRect.top - containerRect.top + container.scrollTop;
    const targetTop =
      relativeTop - container.clientHeight / 2 + lineRect.height / 2;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });

    seekClickRef.current = false;
  }, [highlightLineIndex, autoScroll, isPlaying, isShadowingMode]);

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
      return item.text.toLowerCase().includes(term) || ua.includes(term);
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

  const handleExportVtt = () => {
    downloadVttFile(transcript, `${videoId}.vtt`);
  };

  const buildStudyExportInput = useCallback(() => {
    const labels: StudyExportLabels = {
      documentTitle: videoTitle?.trim() || videoId,
      videoUrl: t('export.videoUrl'),
      generatedAt: t('export.generatedAt'),
      sectionTranscript: t('export.sectionTranscript'),
      sectionSummary: t('export.sectionSummary'),
      sectionGrammar: t('export.sectionGrammar'),
      sectionNotes: t('export.sectionNotes'),
      sectionDifficulty: t('export.sectionDifficulty'),
      sectionTimeline: t('export.sectionTimeline'),
      sectionQuiz: t('export.sectionQuiz'),
      mainIdeas: t('export.mainIdeas'),
      noAnalysis: t('export.noAnalysis'),
      english: t('transcript.english'),
    };

    return {
      videoId,
      title: videoTitle,
      url: videoUrl,
      transcript,
      fullText,
      interfaceLanguage: language,
      translations: bilingualMode ? translations : null,
      translationLanguage: bilingualMode ? translationLanguage : undefined,
      labels,
    };
  }, [
    videoId,
    videoTitle,
    videoUrl,
    transcript,
    fullText,
    language,
    bilingualMode,
    translations,
    translationLanguage,
    t,
  ]);

  const handleExportMarkdown = () => {
    setExportError('');
    downloadStudyReportMarkdown(buildStudyExportInput());
  };

  const handleExportPdf = async () => {
    if (exportingPdf) return;

    setExportingPdf(true);
    try {
      await downloadStudyReportPdf(buildStudyExportInput());
    } catch {
      setExportError(t('export.pdfError'));
    } finally {
      setExportingPdf(false);
    }
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

      onSaveToFlashcards(prepared.word, prepared.example, prepared.translation);
    } catch (error) {
      setSelectionError(
        error instanceof Error ? error.message : 'Не вдалося отримати переклад'
      );
    } finally {
      setSavingSelection(false);
    }
  };

  const selectedWordCount = useMemo(
    () => countSelectionWords(selectedText),
    [selectedText]
  );

  const canSaveSelectionToFlashcards =
    selectedWordCount >= 1 && selectedWordCount <= 3;

  const canExplainSentence = selectedWordCount >= 2;

  const selectedAlreadySaved = useMemo(
    () => Boolean(selectedText) && hasFlashcard(selectedText),
    [selectedText, flashcardsRefreshKey]
  );

  const handleTranslationLanguageChange = (languageCode: string) => {
    if (!isTranslationLanguage(languageCode)) return;

    saveTranslationLanguage(languageCode);
    setTranslationLanguage(languageCode);
    if (translationEnabled) {
      setTranslationEnabled(false);
      setTranslations(null);
      setTranslateError('');
    }
  };

  const handleToggleTranslation = async () => {
    if (translationEnabled) {
      setTranslationEnabled(false);
      return;
    }

    setTranslationEnabled(true);
    setTranslations(null);
    await loadTranslations(translationLanguage);
  };

  const handleRetranslate = async () => {
    if (!translationEnabled) return;
    clearBilingualCache(videoId, translationLanguage);
    setTranslations(null);
    await loadTranslations(translationLanguage);
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/60 dark:bg-gray-800/60">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('transcript.title')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {transcript.length} {t('transcript.lines')}
              {onSeek && ` · ${t('transcript.seekHint')}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onShadowingClick && (
              <button
                type="button"
                onClick={onShadowingClick}
                className="px-3 py-1.5 text-sm rounded-lg transition bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900 font-semibold"
              >
                {t('actions.shadowing')}
              </button>
            )}
            <ToolbarMenu
              label={copied ? '✓ Export' : t('actions.export')}
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
                {
                  id: 'vtt',
                  label: '📺 Export .vtt',
                  onClick: handleExportVtt,
                },
                {
                  id: 'markdown',
                  label: t('export.markdown'),
                  onClick: handleExportMarkdown,
                },
                {
                  id: 'pdf',
                  label: exportingPdf ? '…' : t('export.pdf'),
                  onClick: handleExportPdf,
                  disabled: exportingPdf,
                },
              ]}
            />
            <button
              type="button"
              onClick={toggleAutoScroll}
              title={
                autoScroll
                  ? t('transcript.scrollTooltipOn')
                  : t('transcript.scrollTooltipOff')
              }
              aria-label={
                autoScroll
                  ? t('transcript.scrollAriaOn')
                  : t('transcript.scrollAriaOff')
              }
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                autoScroll
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {autoScroll ? t('actions.scrollOn') : t('actions.scroll')}
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-3 border-b border-gray-100 dark:border-gray-700/80">
          <TranslationLanguageSelect
            selectedLanguage={translationLanguage}
            isLoading={translating}
            translationEnabled={translationEnabled}
            translationShortCode={translationShortCode}
            translateProgress={translateProgress}
            hasTranslations={Boolean(translations)}
            onChange={handleTranslationLanguageChange}
            onToggleTranslation={handleToggleTranslation}
            onRetranslate={handleRetranslate}
            onCancelTranslation={cancelTranslation}
          />

          <div className="relative">
            <input
              type="search"
              placeholder={t('transcript.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white dark:focus:bg-gray-900"
            />
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden
            >
              🔍
            </span>
            {searchTerm && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {t('transcript.searchResults', {
                  shown: filteredIndices.length,
                  total: transcript.length,
                })}
              </p>
            )}
          </div>
        </div>

        {(translateError || exportError) && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {translateError || exportError}
          </div>
        )}

        {selectedText && (
          <div className="mx-4 sm:mx-5 mt-4 p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg relative">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('transcript.selected')}
              </p>
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
            <div className="flex flex-wrap gap-2 items-start">
              {onSaveToFlashcards &&
                canSaveSelectionToFlashcards &&
                (selectedAlreadySaved ? (
                  <span className="inline-flex px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg font-medium">
                    {t('transcript.alreadyInCards')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveSelection}
                    disabled={savingSelection}
                    className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                  >
                    {savingSelection
                      ? t('transcript.savingFlashcard')
                      : t('transcript.saveFlashcard')}
                  </button>
                ))}
              {canExplainSentence && (
                <SentenceExplanation
                  sentence={selectedText}
                  onPauseVideo={onPauseVideo}
                />
              )}
              <SelectionTranslate
                selectedText={selectedText}
                targetLanguage={translationLanguage}
                onPauseVideo={onPauseVideo}
              />
            </div>
            <SelectionAnalysis selectedText={selectedText} />
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onMouseUp={handleSelection}
          className="h-[min(32rem,calc(100dvh-14rem))] lg:h-[min(32rem,calc(100dvh-12rem))] overflow-y-auto overscroll-y-contain bg-white dark:bg-gray-900"
        >
          {bilingualMode && translations && !translating && (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 min-[480px]:gap-3 sm:gap-5 sticky top-0 z-10 px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
              <span className="min-[480px]:border-r border-gray-200 dark:border-gray-700 min-[480px]:pr-3 sm:pr-5">
                {t('transcript.english')}
              </span>
              <span className="text-teal-600 dark:text-teal-400 pl-1 sm:pl-0">
                {translationLabel}
              </span>
            </div>
          )}

          {translating ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 px-4">
              <p className="text-base font-medium mb-1">
                {t('transcript.translating', {
                  done: translateProgress.done,
                  total: translateProgress.total,
                })}
              </p>
              <p className="text-sm">
                {t('transcript.translatingProgress', {
                  done: translateProgress.done,
                  total: translateProgress.total,
                })}
              </p>
            </div>
          ) : filteredIndices.length > 0 ? (
            <div className="py-2">
              {filteredIndices.map(({ item, index }) =>
                bilingualMode && translations ? (
                  <BilingualLine
                    key={`${item.start ?? 'line'}-${index}`}
                    item={item}
                    translation={translations[index] ?? ''}
                    lineIndex={index}
                    isActive={index === highlightLineIndex}
                    isShadowing={isShadowingMode && index === highlightLineIndex}
                    onSeek={handleSeek}
                    lineRef={setLineRef(index)}
                    seekTitle={t('transcript.seekLine')}
                  />
                ) : (
                  <TranscriptLine
                    key={`${item.start ?? 'line'}-${index}`}
                    item={item}
                    lineIndex={index}
                    isActive={index === highlightLineIndex}
                    isShadowing={isShadowingMode && index === highlightLineIndex}
                    onSeek={handleSeek}
                    lineRef={setLineRef(index)}
                    seekTitle={t('transcript.seekLine')}
                  />
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">
              {t('transcript.noResults')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
