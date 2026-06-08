'use client';

import { useState } from 'react';

interface TextProcessorProps {
  text: string;
}

export default function TextProcessor({ text }: TextProcessorProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          query,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process text');
        return;
      }

      setResult(data.result);
    } catch (err) {
      setError('Error connecting to AI service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleProcess();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Text Analysis</h2>

      {/* Quick Action Buttons */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setQuery('Extract all phrasal verbs from this text')}
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          📌 Phrasal Verbs
        </button>
        <button
          onClick={() => setQuery('Translate this text to Ukrainian')}
          className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
        >
          🌍 Translate UA
        </button>
        <button
          onClick={() => setQuery('Create a summary of this text')}
          className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition"
        >
          📝 Summary
        </button>
        <button
          onClick={() => setQuery('Extract key words and concepts')}
          className="px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
        >
          🔑 Keywords
        </button>
      </div>

      {/* Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Query (Ctrl+Enter to submit)
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 'Extract all phrasal verbs', 'Translate to Ukrainian', 'Find similar phrases', etc."
          className="w-full h-20 px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleProcess}
        disabled={loading || !query.trim()}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Processing...' : '✨ Analyze Text'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-400 dark:border-red-500 rounded">
          <p className="text-red-800 dark:text-red-300 font-medium">Error:</p>
          <p className="text-red-700 dark:text-red-400">{error}</p>
          {error.includes('Cannot connect to AI API') && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              ℹ️ Переконайтесь, що локальний AI-сервер запущено на порту 1234
            </p>
          )}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/40 border-l-4 border-green-400 dark:border-green-500 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Query: {query}</p>
          <div className="bg-white dark:bg-gray-900 p-3 rounded border border-green-200 dark:border-green-800 max-h-96 overflow-y-auto">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
              alert('Result copied to clipboard!');
            }}
            className="mt-2 px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
          >
            📋 Copy Result
          </button>
        </div>
      )}
    </div>
  );
}
