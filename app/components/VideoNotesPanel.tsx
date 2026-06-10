'use client';

import { useCallback, useEffect, useState } from 'react';
import { getNotesCache, setNotesCache } from '../lib/notesCache';
import type { VideoNotesResult } from '../lib/videoNotes';
import { useI18n } from './InterfaceLanguageProvider';

interface VideoNotesPanelProps {
  videoId: string;
  transcriptText: string;
  showPanel?: boolean;
  onShowPanelChange?: (show: boolean) => void;
  hideButton?: boolean;
}

export default function VideoNotesPanel({
  videoId,
  transcriptText,
  showPanel: controlledShowPanel,
  onShowPanelChange,
  hideButton = false,
}: VideoNotesPanelProps) {
  const { taskLanguage, t } = useI18n();
  const [notes, setNotes] = useState<VideoNotesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [internalShowPanel, setInternalShowPanel] = useState(false);
  const showPanel = controlledShowPanel ?? internalShowPanel;

  const setShowPanel = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(showPanel) : value;
    if (onShowPanelChange) {
      onShowPanelChange(next);
    } else {
      setInternalShowPanel(next);
    }
  };

  useEffect(() => {
    setNotes(null);
    setLoading(false);
    setError('');
    setFromCache(false);
    if (!onShowPanelChange) {
      setInternalShowPanel(false);
    }
  }, [videoId, transcriptText.length, taskLanguage, onShowPanelChange]);

  const loadNotes = useCallback(async () => {
    setError('');
    setShowPanel(true);

    const cached = getNotesCache(videoId, transcriptText.length, taskLanguage);
    if (cached) {
      setNotes(cached);
      setFromCache(true);
      return;
    }

    setLoading(true);
    setFromCache(false);
    setNotes(null);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcriptText,
          taskLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      const result: VideoNotesResult = {
        title: data.title,
        mainIdeas: data.mainIdeas ?? [],
        sections: data.sections ?? [],
      };

      setNotesCache(videoId, transcriptText.length, taskLanguage, result);
      setNotes(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Помилка створення нотаток'
      );
      setNotes(null);
    } finally {
      setLoading(false);
    }
  }, [taskLanguage, setShowPanel, transcriptText, videoId]);

  useEffect(() => {
    if (!showPanel || notes || loading) return;
    void loadNotes();
  }, [showPanel, notes, loading, loadNotes]);

  return (
    <>
      {!hideButton && (
        <button
          type="button"
          onClick={loadNotes}
          disabled={loading}
          className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
            showPanel
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900'
          }`}
        >
          {loading ? t('common.loading') : t('actions.notes')}
        </button>
      )}

      {showPanel && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {t('notes.title')}
              {fromCache && (
                <span className="ml-2 text-xs font-normal text-emerald-500 dark:text-emerald-400">
                  {t('common.cache')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-200 transition"
              aria-label={t('notes.close')}
            >
              ✕
            </button>
          </div>

          {loading && (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {t('notes.generating')}
            </p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {notes && !loading && (
            <article className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {notes.title}
              </h3>

              {notes.mainIdeas.length > 0 && (
                <section>
                  <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                    {t('notes.mainIdeas')}
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {notes.mainIdeas.map((idea, index) => (
                      <li key={`idea-${index}`} className="leading-relaxed">
                        {idea}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {notes.sections.map((section, sectionIndex) => (
                <section key={`section-${sectionIndex}`}>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {section.heading}
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={`section-${sectionIndex}-bullet-${bulletIndex}`}
                        className="leading-relaxed"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </article>
          )}
        </div>
      )}
    </>
  );
}
