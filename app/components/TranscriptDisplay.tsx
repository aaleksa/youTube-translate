'use client';

import { useState } from 'react';

interface TranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptItem[];
  fullText: string;
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return '';
  
  // Handle formats like "00:00:05.440" or "0:00:05,440"
  const cleaned = timestamp.replace(',', '.');
  
  // Check if it's already in proper format
  if (/^\d{1,2}:\d{2}:\d{2}\.\d+$/.test(cleaned)) {
    // Return just HH:MM:SS part
    return cleaned.split('.')[0];
  }
  
  return cleaned;
}

export default function TranscriptDisplay({
  transcript,
  fullText
}: TranscriptDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const filteredTranscript = transcript.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search in transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
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

        {/* Selected Text */}
        {selectedText && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-400 dark:border-yellow-500 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Selected:</p>
            <p className="text-gray-800 dark:text-gray-200 italic">"{selectedText}"</p>
          </div>
        )}

        {/* Transcript Display */}
        <div
          onMouseUp={handleSelection}
          className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
        >
          {filteredTranscript.length > 0 ? (
            <div className="space-y-2">
              {filteredTranscript.map((item, index) => (
                <div
                  key={index}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed cursor-text hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded transition"
                >
                  {showTimestamps && item.start ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-300 whitespace-nowrap bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded">
                        {formatTimestamp(item.start)}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
                    </div>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No results found</p>
          ) : (
            <div className="space-y-2">
              {transcript.map((item, index) => (
                <div
                  key={index}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed cursor-text hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded transition"
                >
                  {showTimestamps && item.start ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-300 whitespace-nowrap bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded">
                        {formatTimestamp(item.start)}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
                    </div>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
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
