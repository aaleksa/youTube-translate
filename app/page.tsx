'use client';

import { useState } from 'react';
import URLInput from './components/URLInput';
import VideoPlayer from './components/VideoPlayer';
import TranscriptDisplay from './components/TranscriptDisplay';

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
  const [videoData, setVideoData] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <URLInput onSubmit={handleURLSubmit} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {videoData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player (2 columns on large screens) */}
            <div className="lg:col-span-2">
              <VideoPlayer videoId={videoData.videoId} />
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Words</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {videoData.text.split(/\s+/).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Characters</p>
                  <p className="text-2xl font-bold text-green-600">
                    {videoData.text.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lines</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {videoData.transcript.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoData(null)}
                className="w-full mt-6 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Load Another Video
              </button>
            </div>

            {/* Transcript */}
            <div className="lg:col-span-3">
              <TranscriptDisplay
                transcript={videoData.transcript}
                fullText={videoData.text}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter a YouTube URL above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
