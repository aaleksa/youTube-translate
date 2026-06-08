'use client';

import { useEffect, useRef, useState } from 'react';
import URLInput from './components/URLInput';
import {
  addToUrlHistory,
  getUrlHistory,
  type UrlHistoryItem,
} from './lib/urlHistory';
import VideoPlayer, { type VideoPlayerHandle } from './components/VideoPlayer';
import TranscriptDisplay from './components/TranscriptDisplay';
import TextProcessor from './components/TextProcessor';
import { findActiveLineIndex } from './lib/timestamp';

interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptResponse {
  videoId: string;
  transcript: TranscriptItem[];
  text: string;
}

export default function Home() {
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const [videoData, setVideoData] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlHistory, setUrlHistory] = useState<UrlHistoryItem[]>([]);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  useEffect(() => {
    setUrlHistory(getUrlHistory());
  }, []);

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
      setVideoData(data);
      setCurrentPlaybackTime(0);
      setActiveLineIndex(0);
      setUrlHistory(addToUrlHistory(url, data.videoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <URLInput
            onSubmit={handleURLSubmit}
            isLoading={isLoading}
            history={urlHistory}
            onHistoryChange={setUrlHistory}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border dark:border-red-800 rounded-lg shadow">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {videoData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player (2 columns on large screens) */}
            <div className="lg:col-span-2">
              <VideoPlayer
                ref={videoPlayerRef}
                videoId={videoData.videoId}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {videoData.text.split(/\s+/).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {videoData.text.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lines</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {videoData.transcript.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoData(null)}
                className="w-full mt-6 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition"
              >
                Load Another Video
              </button>
            </div>

            {/* Transcript */}
            <div className="lg:col-span-3">
              <TranscriptDisplay
                videoId={videoData.videoId}
                transcript={videoData.transcript}
                fullText={videoData.text}
                activeLineIndex={activeLineIndex}
                onSeek={handleSeek}
              />
            </div>

            {/* Text Processor */}
            <div className="lg:col-span-3">
              <TextProcessor text={videoData.text} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Enter a YouTube URL above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
