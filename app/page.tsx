'use client';

import { useEffect, useRef, useState } from 'react';
import URLInput from './components/URLInput';
import {
  saveToTranscriptHistory,
  type TranscriptHistoryEntry,
} from './lib/transcriptHistory';
import VideoControls from './components/VideoControls';
import VideoPlayer, {
  type VideoPlayerHandle,
  type VideoPlayerState,
} from './components/VideoPlayer';
import TranscriptDisplay from './components/TranscriptDisplay';
import BulkSaveFlashcardModal from './components/BulkSaveFlashcardModal';
import FlashcardsPanel from './components/FlashcardsPanel';
import SaveFlashcardModal from './components/SaveFlashcardModal';
import TextProcessor from './components/TextProcessor';
import QuickInfoAnalysis from './components/QuickInfoAnalysis';
import ReadingStatsPanel from './components/ReadingStatsPanel';
import VideoDifficultyPanel from './components/VideoDifficultyPanel';
import BookmarksPanel from './components/BookmarksPanel';
import { useI18n } from './components/InterfaceLanguageProvider';
import { saveTranscriptLanguage } from './lib/languageSettings';
import {
  type FlashcardDraft,
  getVideoUrl,
} from './lib/flashcards';
import type { ParsedFlashcardItem } from './lib/parseFlashcardList';
import { findActiveLineIndex } from './lib/timestamp';
interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptResponse {
  videoId: string;
  title?: string;
  transcript: TranscriptItem[];
  text: string;
  selectedLanguage?: string;
}

export default function Home() {
  const { t } = useI18n();
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const [videoData, setVideoData] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    isReady: false,
  });
  const [flashcardDraft, setFlashcardDraft] = useState<FlashcardDraft | null>(
    null
  );
  const [flashcardsRefreshKey, setFlashcardsRefreshKey] = useState(0);
  const [bulkFlashcardItems, setBulkFlashcardItems] = useState<
    ParsedFlashcardItem[] | null
  >(null);
  const [quickInfoOpen, setQuickInfoOpen] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('yoytube-quick-info-open');
    if (saved !== null) setQuickInfoOpen(saved === 'true');
  }, []);

  const toggleQuickInfo = () => {
    setQuickInfoOpen((prev) => {
      const next = !prev;
      localStorage.setItem('yoytube-quick-info-open', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!videoData) return;
    setActiveLineIndex(findActiveLineIndex(videoData.transcript, currentPlaybackTime));
  }, [currentPlaybackTime, videoData]);

  const handleSeek = (seconds: number, lineIndex: number) => {
    videoPlayerRef.current?.seekTo(seconds);
    setActiveLineIndex(lineIndex);
    setCurrentPlaybackTime(seconds);
  };

  const handleTimeUpdate = (seconds: number) => {
    setCurrentPlaybackTime(seconds);
  };

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      videoPlayerRef.current?.pause();
    } else {
      videoPlayerRef.current?.play();
    }
  };

  const handleStop = () => {
    videoPlayerRef.current?.stop();
    setCurrentPlaybackTime(0);
    setActiveLineIndex(0);
  };

  const handlePauseVideo = () => {
    videoPlayerRef.current?.pause();
  };

  const handleSaveToFlashcards = (
    word: string,
    example: string,
    translation = ''
  ) => {
    if (!videoData) return;
    setFlashcardDraft({
      word,
      translation,
      example,
      videoId: videoData.videoId,
      videoUrl: getVideoUrl(videoData.videoId),
    });
  };

  const handleSaveManyToFlashcards = (items: ParsedFlashcardItem[]) => {
    if (!videoData || items.length === 0) return;
    setBulkFlashcardItems(items);
  };

  const handleFlashcardSaved = () => {
    setFlashcardsRefreshKey((key) => key + 1);
  };

  const loadVideoData = (data: TranscriptResponse, url?: string) => {
    setVideoData(data);
    setCurrentPlaybackTime(0);
    setActiveLineIndex(0);
    setPlayerState({ isPlaying: false, isReady: false });
    setError('');

    if (url) {
      setCurrentVideoUrl(url);
    }

    saveToTranscriptHistory({
      videoId: data.videoId,
      url: url || `https://www.youtube.com/watch?v=${data.videoId}`,
      title: data.title || data.videoId,
      text: data.text,
      transcript: data.transcript,
    });
    if (data.selectedLanguage) {
      saveTranscriptLanguage(data.selectedLanguage);
    }
    setHistoryRefreshKey((key) => key + 1);
  };

  const handleLoadFromHistory = (entry: TranscriptHistoryEntry) => {
    if (isLoading) return;
    loadVideoData(
      {
        videoId: entry.videoId,
        title: entry.title,
        transcript: entry.transcript,
        text: entry.text,
      },
      entry.url
    );
  };

  const handleURLSubmit = async (url: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transcript');
      }

      const data = await response.json();
      loadVideoData(data, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <URLInput
            onSubmit={handleURLSubmit}
            isLoading={isLoading}
            historyRefreshKey={historyRefreshKey}
            onLoadFromHistory={handleLoadFromHistory}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border dark:border-red-800 rounded-lg shadow">
            <p className="font-semibold">{t('page.errorTitle')}</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {videoData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="xl:sticky xl:top-4 space-y-4">
                <div className="rounded-lg overflow-hidden shadow-lg bg-black">
                  <VideoPlayer
                    ref={videoPlayerRef}
                    videoId={videoData.videoId}
                    onTimeUpdate={handleTimeUpdate}
                    onStateChange={setPlayerState}
                  />
                  <div className="hidden xl:block">
                    <VideoControls
                      isPlaying={playerState.isPlaying}
                      isReady={playerState.isReady}
                      onPlayPause={handlePlayPause}
                      onStop={handleStop}
                    />
                  </div>
                </div>
                <BookmarksPanel
                  videoId={videoData.videoId}
                  currentPlaybackTime={currentPlaybackTime}
                  transcript={videoData.transcript}
                  isPlayerReady={playerState.isReady}
                  onSeek={handleSeek}
                />
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {t('quickInfo.title')}
                    </h3>
                    <button
                      type="button"
                      onClick={toggleQuickInfo}
                      aria-expanded={quickInfoOpen}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {quickInfoOpen ? t('quickInfo.collapse') : t('quickInfo.expand')}
                    </button>
                  </div>
                  {quickInfoOpen && (
                    <>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('quickInfo.words')}
                          </p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {videoData.text.split(/\s+/).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('quickInfo.chars')}
                          </p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {videoData.text.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('quickInfo.lines')}
                          </p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {videoData.transcript.length}
                          </p>
                        </div>
                      </div>
                      <ReadingStatsPanel
                        fullText={videoData.text}
                        transcript={videoData.transcript}
                      />
                      <QuickInfoAnalysis
                        videoId={videoData.videoId}
                        transcriptText={videoData.text}
                        transcript={videoData.transcript}
                        onPauseVideo={handlePauseVideo}
                        onSeek={handleSeek}
                      />
                      <VideoDifficultyPanel
                        videoId={videoData.videoId}
                        transcriptText={videoData.text}
                      />
                      <button
                        onClick={() => setVideoData(null)}
                        className="w-full mt-4 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition text-sm"
                      >
                        {t('quickInfo.loadAnother')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="xl:hidden sticky top-2 z-10 mb-3 rounded-lg overflow-hidden shadow-lg">
                  <VideoControls
                    isPlaying={playerState.isPlaying}
                    isReady={playerState.isReady}
                    onPlayPause={handlePlayPause}
                    onStop={handleStop}
                  />
                </div>
                <TranscriptDisplay
                  videoId={videoData.videoId}
                  videoTitle={videoData.title}
                  videoUrl={getVideoUrl(videoData.videoId)}
                  transcript={videoData.transcript}
                  fullText={videoData.text}
                  activeLineIndex={activeLineIndex}
                  isPlaying={playerState.isPlaying}
                  onSeek={handleSeek}
                  onSaveToFlashcards={handleSaveToFlashcards}
                  flashcardsRefreshKey={flashcardsRefreshKey}
                  onPauseVideo={handlePauseVideo}
                />
              </div>
            </div>

            <TextProcessor
              text={videoData.text}
              videoId={videoData.videoId}
              flashcardsRefreshKey={flashcardsRefreshKey}
              onSaveToFlashcards={handleSaveToFlashcards}
              onSaveManyToFlashcards={handleSaveManyToFlashcards}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('page.enterUrl')}
            </p>
          </div>
        )}

        <div className="mt-6">
          <FlashcardsPanel refreshKey={flashcardsRefreshKey} />
        </div>

        <SaveFlashcardModal
          draft={flashcardDraft}
          onClose={() => setFlashcardDraft(null)}
          onSaved={handleFlashcardSaved}
        />

        {videoData && (
          <BulkSaveFlashcardModal
            items={bulkFlashcardItems}
            videoId={videoData.videoId}
            videoUrl={getVideoUrl(videoData.videoId)}
            onClose={() => setBulkFlashcardItems(null)}
            onSaved={() => handleFlashcardSaved()}
          />
        )}
      </div>
    </div>
  );
}
