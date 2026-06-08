'use client';

import { useEffect, useState } from 'react';
import {
  clearBilingualCache,
  getBilingualCache,
  setBilingualCache,
} from '../lib/bilingualCache';
import { translateAllLines } from '../lib/translateLines';
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
  onSeek?: (seconds: number) => void;
}

function TranscriptLine({
  item,
  showTimestamps,
  onSeek,
}: {
  item: TranscriptItem;
  showTimestamps: boolean;
  onSeek?: (seconds: number) => void;
}) {
  const canSeek = Boolean(item.start && onSeek);

  const handleClick = () => {
    const selection = window.getSelection()?.toString();
    if (selection?.trim()) return;
    if (!item.start || !onSeek) return;
    onSeek(parseTimestampToSeconds(item.start));
  };

  return (
    <div
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
      className={`text-gray-700 dark:text-gray-300 leading-relaxed p-2 rounded transition ${
        canSeek
          ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-800'
          : 'cursor-text hover:bg-gray-200 dark:hover:bg-gray-800'
      }`}
      title={canSeek ? 'Jump to this moment in the video' : undefined}
    >
      {showTimestamps && item.start ? (
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 whitespace-nowrap bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded shrink-0">
            {formatTimestamp(item.start)}
          </span>
          <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
        </div>
      ) : (
        <p>{item.text}</p>
      )}
    </div>
  );
}

function BilingualLine({
  item,
  translation,
  showTimestamps,
  onSeek,
}: {
  item: TranscriptItem;
  translation: string;
  showTimestamps: boolean;
  onSeek?: (seconds: number) => void;
}) {
  const canSeek = Boolean(item.start && onSeek);

  const handleClick = () => {
    const selection = window.getSelection()?.toString();
    if (selection?.trim()) return;
    if (!item.start || !onSeek) return;
    onSeek(parseTimestampToSeconds(item.start));
  };

  return (
    <div
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
      className={`grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 p-2 rounded transition border border-transparent ${
        canSeek
          ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800'
          : ''
      }`}
      title={canSeek ? 'Jump to this moment in the video' : undefined}
    >
      <div className="min-w-0">
        {showTimestamps && item.start && (
          <span className="inline-block text-xs font-bold text-blue-600 dark:text-blue-300 whitespace-nowrap bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded mb-1">
            {formatTimestamp(item.start)}
          </span>
        )}
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
  onSeek,
}: TranscriptDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [translations, setTranslations] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ done: 0, total: 0 });
  const [translateError, setTranslateError] = useState('');

  useEffect(() => {
    setBilingualMode(false);
    setTranslations(null);
    setTranslateError('');
    setTranslateProgress({ done: 0, total: 0 });
  }, [videoId, transcript.length]);

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
    const text = window.getSelection()?.toString() || '';
    setSelectedText(text);
  };

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

        {onSeek && !bilingualMode && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Click a line or timestamp to jump to that moment in the video.
          </p>
        )}

        {bilingualMode && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Двомовний режим: англійська зліва, українська справа. Клік по рядку — перехід у відео.
          </p>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search in transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`px-4 py-2 rounded-lg transition ${
              showTimestamps
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            {showTimestamps ? '⏱️ Hide Timestamps' : '⏱️ Show Timestamps'}
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

        {selectedText && !bilingualMode && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-400 dark:border-yellow-500 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Selected:</p>
            <p className="text-gray-800 dark:text-gray-200 italic">&quot;{selectedText}&quot;</p>
          </div>
        )}

        {bilingualMode && translations && (
          <div className="hidden md:grid md:grid-cols-2 gap-4 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span>English</span>
            <span>Українська</span>
          </div>
        )}

        <div
          onMouseUp={bilingualMode ? undefined : handleSelection}
          className="max-h-[32rem] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
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
                    showTimestamps={showTimestamps}
                    onSeek={onSeek}
                  />
                ) : (
                  <TranscriptLine
                    key={`${item.start ?? 'line'}-${index}`}
                    item={item}
                    showTimestamps={showTimestamps}
                    onSeek={onSeek}
                  />
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No results found</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {fullText.split(/\s+/).length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {fullText.length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/50 p-3 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Lines</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {transcript.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
