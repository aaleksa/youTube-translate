'use client';

import { useState } from 'react';
import { formatTimestamp, parseTimestampToSeconds } from '../lib/timestamp';

interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptItem[];
  fullText: string;
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

export default function TranscriptDisplay({
  transcript,
  fullText,
  onSeek,
}: TranscriptDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const filteredTranscript = transcript.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayTranscript = searchTerm ? filteredTranscript : transcript;

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

  return (
    <div className="w-full space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Transcript</h2>

        {onSeek && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Click a line or timestamp to jump to that moment in the video.
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
        </div>

        {selectedText && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-400 dark:border-yellow-500 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Selected:</p>
            <p className="text-gray-800 dark:text-gray-200 italic">&quot;{selectedText}&quot;</p>
          </div>
        )}

        <div
          onMouseUp={handleSelection}
          className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
        >
          {displayTranscript.length > 0 ? (
            <div className="space-y-2">
              {displayTranscript.map((item, index) => (
                <TranscriptLine
                  key={`${item.start ?? 'line'}-${index}`}
                  item={item}
                  showTimestamps={showTimestamps}
                  onSeek={onSeek}
                />
              ))}
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
