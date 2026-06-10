'use client';

import { useEffect, useState } from 'react';
import type { GrammarHighlightsResult } from '../lib/grammarHighlights';
import { getGrammarCache, setGrammarCache } from '../lib/grammarCache';
import type { VideoSummaryResult } from '../lib/videoSummary';
import { getSummaryCache, setSummaryCache } from '../lib/summaryCache';
import { shouldAutoPause } from '../lib/learningSettings';
import { useI18n } from './InterfaceLanguageProvider';
import VideoNotesPanel from './VideoNotesPanel';
import VideoQuizPanel from './VideoQuizPanel';
import VideoChaptersPanel from './VideoChaptersPanel';
import VideoTimelinePanel from './VideoTimelinePanel';

interface TranscriptItem {
  text: string;
  start?: string;
}

interface QuickInfoAnalysisProps {
  videoId: string;
  transcriptText: string;
  transcript: TranscriptItem[];
  onPauseVideo?: () => void;
  onSeek: (seconds: number, lineIndex: number) => void;
}

export default function QuickInfoAnalysis({
  videoId,
  transcriptText,
  transcript,
  onPauseVideo,
  onSeek,
}: QuickInfoAnalysisProps) {
  const { language, t, translationLanguage, taskLanguage } = useI18n();
  const [summary, setSummary] = useState<VideoSummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryFromCache, setSummaryFromCache] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [grammar, setGrammar] = useState<GrammarHighlightsResult | null>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState('');
  const [grammarFromCache, setGrammarFromCache] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  useEffect(() => {
    setSummary(null);
    setSummaryLoading(false);
    setSummaryError('');
    setSummaryFromCache(false);
    setShowSummary(false);
    setGrammar(null);
    setGrammarLoading(false);
    setGrammarError('');
    setGrammarFromCache(false);
    setShowGrammar(false);
    setShowQuiz(false);
    setShowNotes(false);
    setShowTimeline(false);
    setShowChapters(false);
  }, [videoId, transcriptText.length]);

  const handleSummary = async () => {
    setSummaryError('');
    setShowSummary(true);

    const cached = getSummaryCache(videoId, transcriptText.length);
    if (cached) {
      setSummary(cached);
      setSummaryFromCache(true);
      return;
    }

    setSummaryLoading(true);
    setSummaryFromCache(false);

    try {
      const response = await fetch('/api/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcriptText,
          taskLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      const result: VideoSummaryResult = { summary: data.summary };
      setSummaryCache(videoId, transcriptText.length, result);
      setSummary(result);
    } catch (error) {
      setSummaryError(
        error instanceof Error ? error.message : 'Помилка створення резюме'
      );
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGrammar = async () => {
    if (shouldAutoPause('grammarAnalysis')) {
      onPauseVideo?.();
    }

    setGrammarError('');
    setShowGrammar(true);

    const cached = getGrammarCache(videoId, transcriptText.length);
    if (cached) {
      setGrammar(cached);
      setGrammarFromCache(true);
      return;
    }

    setGrammarLoading(true);
    setGrammarFromCache(false);

    try {
      const response = await fetch('/api/grammar-highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcriptText,
          translationLanguage,
          taskLanguage,
          interfaceLanguage: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze grammar');
      }

      const result: GrammarHighlightsResult = {
        highlights: data.highlights ?? [],
      };
      setGrammarCache(videoId, transcriptText.length, result);
      setGrammar(result);
    } catch (error) {
      setGrammarError(
        error instanceof Error ? error.message : 'Помилка граматичного аналізу'
      );
      setGrammar(null);
    } finally {
      setGrammarLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={handleSummary}
          disabled={summaryLoading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showSummary
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900'
          }`}
        >
          {summaryLoading ? t('common.loading') : t('actions.summary')}
        </button>
        <button
          type="button"
          onClick={handleGrammar}
          disabled={grammarLoading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showGrammar
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900'
          }`}
        >
          {grammarLoading ? t('common.loading') : t('actions.grammar')}
        </button>
        <button
          type="button"
          onClick={() => setShowNotes((prev) => !prev)}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            showNotes
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900'
          }`}
        >
          {t('actions.notes')}
        </button>
        <button
          type="button"
          onClick={() => setShowChapters((prev) => !prev)}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            showChapters
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900'
          }`}
        >
          {t('actions.chapters')}
        </button>
        <button
          type="button"
          onClick={() => setShowTimeline((prev) => !prev)}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            showTimeline
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'
          }`}
        >
          {t('actions.timeline')}
        </button>
        <button
          type="button"
          onClick={() =>
            setShowQuiz((prev) => {
              if (!prev && shouldAutoPause('quiz')) {
                onPauseVideo?.();
              }
              return !prev;
            })
          }
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            showQuiz
              ? 'bg-cyan-500 text-white hover:bg-cyan-600'
              : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:hover:bg-cyan-900'
          }`}
        >
          {t('actions.quiz')}
        </button>
      </div>

      {showSummary && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              {t('quickInfo.summaryTitle')}
              {summaryFromCache && (
                <span className="ml-2 text-xs font-normal text-blue-500 dark:text-blue-400">
                  {t('common.cache')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition"
              aria-label="Закрити резюме"
            >
              ✕
            </button>
          </div>

          {summaryLoading && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('quickInfo.summaryLoading')}
            </p>
          )}

          {summaryError && !summaryLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">{summaryError}</p>
          )}

          {summary && !summaryLoading && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary.summary}
            </p>
          )}
        </div>
      )}

      {showGrammar && (
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
              {t('quickInfo.grammarTitle')}
              {grammar?.highlights && ` (${grammar.highlights.length})`}
              {grammarFromCache && (
                <span className="ml-2 text-xs font-normal text-purple-500 dark:text-purple-400">
                  {t('common.cache')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowGrammar(false)}
              className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 transition"
              aria-label="Закрити граматичний аналіз"
            >
              ✕
            </button>
          </div>

          {grammarLoading && (
            <p className="text-sm text-purple-700 dark:text-purple-300">
              ⏳ AI аналізує граматичні конструкції...
            </p>
          )}

          {grammarError && !grammarLoading && (
            <p className="text-sm text-red-600 dark:text-red-400">{grammarError}</p>
          )}

          {grammar && !grammarLoading && grammar.highlights.length === 0 && (
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Помітних граматичних патернів не знайдено.
            </p>
          )}

          {grammar && !grammarLoading && grammar.highlights.length > 0 && (
            <ul className="space-y-2">
              {grammar.highlights.map((item, index) => (
                <li
                  key={`${item.pattern}-${index}`}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    {item.pattern}
                  </span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    ×{item.count}
                  </span>
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                    {item.note}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <VideoNotesPanel
        videoId={videoId}
        transcriptText={transcriptText}
        showPanel={showNotes}
        onShowPanelChange={setShowNotes}
        hideButton
      />

      <VideoQuizPanel
        videoId={videoId}
        transcriptText={transcriptText}
        showPanel={showQuiz}
        onShowPanelChange={setShowQuiz}
        hideButton
      />

      <VideoChaptersPanel
        videoId={videoId}
        transcript={transcript}
        transcriptTextLength={transcriptText.length}
        showPanel={showChapters}
        onShowPanelChange={setShowChapters}
        hideButton
        onSeek={onSeek}
      />

      <VideoTimelinePanel
        videoId={videoId}
        transcript={transcript}
        transcriptTextLength={transcriptText.length}
        showPanel={showTimeline}
        onShowPanelChange={setShowTimeline}
        hideButton
        onSeek={onSeek}
      />
    </div>
  );
}
