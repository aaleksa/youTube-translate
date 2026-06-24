'use client';

import { useEffect, useState } from 'react';
import { fetchAiApi } from '../lib/aiApiClient';

const SELECTION_ANALYSIS_QUERY =
  'Analyze this English excerpt for a Ukrainian learner: explain key vocabulary, grammar points, and overall meaning. Respond in Ukrainian.';

interface SelectionAnalysisProps {
  selectedText: string;
}

export default function SelectionAnalysis({ selectedText }: SelectionAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setResult(null);
    setTruncated(false);
    setError('');
  }, [selectedText]);

  const handleAnalyze = async () => {
    if (!selectedText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setTruncated(false);

    try {
      const response = await fetchAiApi('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          query: SELECTION_ANALYSIS_QUERY,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to analyze selection');
        return;
      }

      setResult(data.result);
      setTruncated(Boolean(data.truncated));
    } catch {
      setError('Error connecting to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-yellow-300/60 dark:border-yellow-700/60">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !selectedText.trim()}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳ Analyzing...' : '✨ Analyze Selection'}
      </button>

      {(result || error) && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-yellow-200 dark:border-yellow-800 relative">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setTruncated(false);
              setError('');
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg leading-none"
            aria-label="Закрити результат"
          >
            ✕
          </button>
          {truncated && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-2 pr-6">
              Текст було скорочено через обмеження контексту моделі.
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 pr-6">{error}</p>
          )}
          {result && (
            <>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap pr-6">
                {result}
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
                className="mt-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                📋 Copy Result
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
