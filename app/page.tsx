'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import VideoMetadataPanel from './components/VideoMetadataPanel';
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
import {
  getCachedTranscript,
  getCachedTranscriptByUrl,
  setCachedTranscript,
  type TranscriptCacheData,
} from './lib/transcriptCache';
import {
  buildVideoWatchUrl,
  isPlaylistUrl,
} from './lib/youtubeUrl';
import type { PlaylistVideoWithTranscript } from './lib/playlistTranscript';
import PlaylistPanel, {
  type PlaylistLoadProgress,
  type PlaylistSession,
} from './components/PlaylistPanel';
import ShadowingPanel from './components/ShadowingPanel';
import {
  enrichTranscriptData,
  mapRawCaptionIndexesToDisplayIndexes,
} from './lib/transcriptPipeline';
import type { PhraseChunk, RawCaption, Sentence } from './lib/transcriptTypes';
import type { TranscriptCue } from './lib/transcriptCue';

interface TranscriptResponse {
  videoId: string;
  title?: string;
  channelName?: string;
  durationSeconds?: number;
  transcript: TranscriptCue[];
  displayTranscript?: TranscriptCue[];
  displayLines?: RawCaption[];
  rawCaptions?: RawCaption[];
  sentences?: Sentence[];
  phrases?: PhraseChunk[];
  text: string;
  selectedLanguage?: string;
  subtitleLanguageName?: string;
  subtitleLanguageKind?: 'manual' | 'auto';
}

export default function Home() {
  const { t } = useI18n();
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const shadowingPanelRef = useRef<HTMLDivElement>(null);
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
  const [cacheNotice, setCacheNotice] = useState('');
  const [playlistSession, setPlaylistSession] =
    useState<PlaylistSession | null>(null);
  const [playlistLoadProgress, setPlaylistLoadProgress] =
    useState<PlaylistLoadProgress | null>(null);
  const [shadowingLineIndex, setShadowingLineIndex] = useState<number | null>(
    null
  );
  const [shadowingCaptionIndexes, setShadowingCaptionIndexes] = useState<
    number[]
  >([]);
  const [showRawTranscript, setShowRawTranscript] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('yoytube-quick-info-open');
    if (saved !== null) setQuickInfoOpen(saved === 'true');
    const rawView = localStorage.getItem('yoytube-transcript-raw-view');
    if (rawView !== null) setShowRawTranscript(rawView === 'true');
  }, []);

  const visibleTranscript = useMemo(() => {
    if (!videoData) return [];
    if (showRawTranscript) return videoData.transcript;
    return videoData.displayTranscript?.length
      ? videoData.displayTranscript
      : videoData.transcript;
  }, [showRawTranscript, videoData]);

  const toggleQuickInfo = () => {
    setQuickInfoOpen((prev) => {
      const next = !prev;
      localStorage.setItem('yoytube-quick-info-open', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!videoData) return;
    const nextIndex = findActiveLineIndex(
      visibleTranscript,
      currentPlaybackTime
    );
    setActiveLineIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  }, [currentPlaybackTime, videoData, visibleTranscript]);

  const handleShadowingCaptionIndexes = useCallback(
    (rawIndexes: number[]) => {
      if (!videoData?.displayLines?.length || showRawTranscript) {
        setShadowingCaptionIndexes(rawIndexes);
        return;
      }

      setShadowingCaptionIndexes(
        mapRawCaptionIndexesToDisplayIndexes(videoData.displayLines, rawIndexes)
      );
    },
    [showRawTranscript, videoData?.displayLines]
  );

  const toggleRawTranscript = () => {
    setShowRawTranscript((prev) => {
      const next = !prev;
      localStorage.setItem('yoytube-transcript-raw-view', String(next));
      return next;
    });
  };

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

  const loadVideoData = (
    data: TranscriptResponse,
    url?: string,
    options?: { fromCache?: boolean; keepPlaylist?: boolean }
  ) => {
    const enriched = enrichTranscriptData(data);
    setVideoData(enriched);
    setCurrentPlaybackTime(0);
    setActiveLineIndex(0);
    setPlayerState({ isPlaying: false, isReady: false });
    setError('');
    setCacheNotice(options?.fromCache ? t('transcript.cacheLoaded') : '');

    if (url) {
      setCurrentVideoUrl(url);
    }

    saveToTranscriptHistory({
      videoId: enriched.videoId,
      url: url || `https://www.youtube.com/watch?v=${enriched.videoId}`,
      title: enriched.title || enriched.videoId,
      text: enriched.text,
      transcript: enriched.transcript,
    });
    if (enriched.selectedLanguage) {
      saveTranscriptLanguage(enriched.selectedLanguage);
    }
    setHistoryRefreshKey((key) => key + 1);

    if (!options?.keepPlaylist) {
      setPlaylistSession(null);
      setPlaylistLoadProgress(null);
    }
  };

  const fetchTranscriptForUrl = async (
    videoUrl: string
  ): Promise<TranscriptCacheData> => {
    const cached = await getCachedTranscriptByUrl(videoUrl);
    if (cached) {
      return cached.data;
    }

    const response = await fetch('/api/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transcript');
    }

    const data = (await response.json()) as TranscriptCacheData;
    await setCachedTranscript(videoUrl, data);
    return data;
  };

  const loadPlaylist = async (playlistUrl: string) => {
    setPlaylistSession(null);
    setPlaylistLoadProgress(null);
    setVideoData(null);
    setCacheNotice('');

    const playlistResponse = await fetch('/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: playlistUrl }),
    });

    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      throw new Error(errorData.error || 'Failed to fetch playlist');
    }

    const playlistData = (await playlistResponse.json()) as {
      playlistId: string;
      title: string;
      videos: Array<{ videoId: string; title: string; index: number }>;
    };

    const loadedVideos: PlaylistVideoWithTranscript[] = [];
    const failedVideoIds: string[] = [];

    setPlaylistLoadProgress({
      done: 0,
      total: playlistData.videos.length,
      currentTitle: playlistData.videos[0]?.title ?? '',
    });

    for (let i = 0; i < playlistData.videos.length; i++) {
      const video = playlistData.videos[i];
      const videoUrl = buildVideoWatchUrl(video.videoId);

      setPlaylistLoadProgress({
        done: i,
        total: playlistData.videos.length,
        currentTitle: video.title,
      });

      try {
        const transcript = await fetchTranscriptForUrl(videoUrl);
        loadedVideos.push({
          videoId: video.videoId,
          title: video.title,
          index: video.index,
          transcript,
        });
      } catch (videoError) {
        console.error(`Failed to load video ${video.videoId}:`, videoError);
        failedVideoIds.push(video.videoId);
      }

      setPlaylistLoadProgress({
        done: i + 1,
        total: playlistData.videos.length,
        currentTitle: video.title,
      });
    }

    if (loadedVideos.length === 0) {
      throw new Error(t('playlist.allVideosFailed'));
    }

    const firstVideo = loadedVideos[0];
    const session: PlaylistSession = {
      playlistId: playlistData.playlistId,
      title: playlistData.title,
      playlistUrl,
      videos: loadedVideos,
      activeVideoId: firstVideo.videoId,
      failedVideoIds,
    };

    setPlaylistSession(session);
    setPlaylistLoadProgress(null);
    loadVideoData(
      firstVideo.transcript as TranscriptResponse,
      buildVideoWatchUrl(firstVideo.videoId),
      { keepPlaylist: true }
    );
  };

  const handleSelectPlaylistVideo = (videoId: string) => {
    if (!playlistSession) return;

    const video = playlistSession.videos.find(
      (item) => item.videoId === videoId
    );
    if (!video) return;

    setPlaylistSession({
      ...playlistSession,
      activeVideoId: videoId,
    });
    loadVideoData(
      video.transcript as TranscriptResponse,
      buildVideoWatchUrl(videoId),
      { keepPlaylist: true }
    );
  };

  const handleLoadFromHistory = async (entry: TranscriptHistoryEntry) => {
    if (isLoading) return;

    const cached = await getCachedTranscript(entry.videoId);
    if (cached) {
      loadVideoData(cached.data, cached.url || entry.url, { fromCache: true });
      return;
    }

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
    setCacheNotice('');
    setPlaylistSession(null);
    setPlaylistLoadProgress(null);

    const trimmedUrl = url.trim();

    try {
      if (isPlaylistUrl(trimmedUrl)) {
        await loadPlaylist(trimmedUrl);
        return;
      }

      const cached = await getCachedTranscriptByUrl(trimmedUrl);
      if (cached) {
        loadVideoData(cached.data, cached.url || trimmedUrl, { fromCache: true });
        return;
      }

      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transcript');
      }

      const data = (await response.json()) as TranscriptCacheData;
      await setCachedTranscript(trimmedUrl, data);
      loadVideoData(data, trimmedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideoData(null);
      setCacheNotice('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-6 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14">
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
        {cacheNotice && !error && (
          <div className="mb-6 p-4 bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 dark:border dark:border-sky-800 rounded-lg shadow">
            <p>{cacheNotice}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border dark:border-red-800 rounded-lg shadow">
            <p className="font-semibold">{t('page.errorTitle')}</p>
            <p>{error}</p>
          </div>
        )}

        <PlaylistPanel
          session={playlistSession}
          loadProgress={playlistLoadProgress}
          onSelectVideo={handleSelectPlaylistVideo}
        />

        {/* Main Content */}
        {videoData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              <div className="lg:sticky lg:top-4 space-y-4">
                <div className="rounded-lg overflow-hidden shadow-lg bg-black">
                  <VideoPlayer
                    ref={videoPlayerRef}
                    videoId={videoData.videoId}
                    onTimeUpdate={handleTimeUpdate}
                    onStateChange={setPlayerState}
                  />
                  <div className="hidden lg:block">
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
                      <VideoMetadataPanel
                        title={videoData.title}
                        channelName={videoData.channelName}
                        durationSeconds={videoData.durationSeconds}
                        subtitleLanguageName={videoData.subtitleLanguageName}
                        subtitleLanguageKind={videoData.subtitleLanguageKind}
                      />
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
                            {visibleTranscript.length}
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
                        onClick={() => {
                          setVideoData(null);
                          setPlaylistSession(null);
                          setPlaylistLoadProgress(null);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition text-sm"
                      >
                        {t('quickInfo.loadAnother')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="lg:hidden sticky top-[max(0.5rem,env(safe-area-inset-top))] z-10 mb-3 rounded-lg overflow-hidden shadow-lg">
                  <VideoControls
                    isPlaying={playerState.isPlaying}
                    isReady={playerState.isReady}
                    onPlayPause={handlePlayPause}
                    onStop={handleStop}
                  />
                </div>
                <div ref={shadowingPanelRef} id="shadowing-panel">
                  <ShadowingPanel
                    videoId={videoData.videoId}
                    transcript={videoData.transcript}
                    phrases={videoData.phrases}
                    currentPlaybackTime={currentPlaybackTime}
                    isPlayerReady={playerState.isReady}
                    speechLanguage={videoData.selectedLanguage}
                    onSeek={handleSeek}
                    onPauseVideo={handlePauseVideo}
                    onLineIndexChange={setShadowingLineIndex}
                    onCaptionIndexesChange={handleShadowingCaptionIndexes}
                  />
                </div>
                <TranscriptDisplay
                  videoId={videoData.videoId}
                  videoTitle={videoData.title}
                  videoUrl={getVideoUrl(videoData.videoId)}
                  transcript={visibleTranscript}
                  fullText={videoData.text}
                  showRawTranscript={showRawTranscript}
                  onToggleRawTranscript={toggleRawTranscript}
                  rawLineCount={videoData.transcript.length}
                  activeLineIndex={activeLineIndex}
                  shadowingLineIndex={shadowingLineIndex}
                  shadowingCaptionIndexes={shadowingCaptionIndexes}
                  sentences={videoData.sentences}
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
