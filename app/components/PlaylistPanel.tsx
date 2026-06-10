'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getPlaylistNotesCache,
  setPlaylistNotesCache,
} from '../lib/playlistNotesCache';
import {
  buildCombinedTranscriptText,
  type PlaylistVideoWithTranscript,
} from '../lib/playlistTranscript';
import type { VideoNotesResult } from '../lib/videoNotes';
import { useI18n } from './InterfaceLanguageProvider';

export interface PlaylistLoadProgress {
  done: number;
  total: number;
  currentTitle: string;
}

export interface PlaylistSession {
  playlistId: string;
  title: string;
  playlistUrl: string;
  videos: PlaylistVideoWithTranscript[];
  activeVideoId: string;
  failedVideoIds: string[];
}

interface PlaylistPanelProps {
  session: PlaylistSession | null;
  loadProgress: PlaylistLoadProgress | null;
  onSelectVideo: (videoId: string) => void;
}

function NotesArticle({
  notes,
  t,
}: {
  notes: VideoNotesResult;
  t: ReturnType<typeof useI18n>['t'];
}) {
  return (
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
  );
}

export default function PlaylistPanel({
  session,
  loadProgress,
  onSelectVideo,
}: PlaylistPanelProps) {
  const { taskLanguage, t } = useI18n();
  const [combinedNotes, setCombinedNotes] = useState<VideoNotesResult | null>(
    null
  );
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [notesFromCache, setNotesFromCache] = useState(false);

  const loadCombinedNotes = useCallback(async (force = false) => {
    if (!session || session.videos.length === 0) return;

    setNotesError('');
    const combinedText = buildCombinedTranscriptText(
      session.videos,
      session.title
    );

    if (!force) {
      const cached = getPlaylistNotesCache(
        session.playlistId,
        combinedText.length
      );
      if (cached) {
        setCombinedNotes(cached);
        setNotesFromCache(true);
        return;
      }
    }

    setNotesLoading(true);
    setNotesFromCache(false);
    setCombinedNotes(null);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedText,
          taskLanguage,
          mode: 'playlist',
          playlistTitle: session.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate combined notes');
      }

      const result: VideoNotesResult = {
        title: data.title,
        mainIdeas: data.mainIdeas ?? [],
        sections: data.sections ?? [],
      };

      setPlaylistNotesCache(
        session.playlistId,
        combinedText.length,
        result
      );
      setCombinedNotes(result);
    } catch (err) {
      setNotesError(
        err instanceof Error ? err.message : t('playlist.notesError')
      );
      setCombinedNotes(null);
    } finally {
      setNotesLoading(false);
    }
  }, [taskLanguage, session, t]);

  useEffect(() => {
    setCombinedNotes(null);
    setNotesError('');
    setNotesFromCache(false);
    setNotesLoading(false);
  }, [session?.playlistId]);

  useEffect(() => {
    if (!session || loadProgress || session.videos.length === 0) return;
    if (combinedNotes || notesLoading) return;
    void loadCombinedNotes();
  }, [
    session,
    loadProgress,
    combinedNotes,
    notesLoading,
    loadCombinedNotes,
  ]);

  if (!session && !loadProgress) return null;

  return (
    <div className="mb-6 space-y-4">
      {loadProgress && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
            {t('playlist.loading')}
          </p>
          <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-3">
            {t('playlist.loadingProgress')
              .replace('{done}', String(loadProgress.done))
              .replace('{total}', String(loadProgress.total))}
            {loadProgress.currentTitle
              ? ` — ${loadProgress.currentTitle}`
              : ''}
          </p>
          <div className="h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
              style={{
                width: `${Math.round((loadProgress.done / loadProgress.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {session && (
        <>
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {session.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('playlist.videoCount')
                .replace('{count}', String(session.videos.length))}
              {session.failedVideoIds.length > 0 &&
                ` · ${t('playlist.failedCount').replace('{count}', String(session.failedVideoIds.length))}`}
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {session.videos.map((video) => (
                <button
                  key={video.videoId}
                  type="button"
                  onClick={() => onSelectVideo(video.videoId)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    session.activeVideoId === video.videoId
                      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-gray-500 dark:text-gray-400 mr-2">
                    {video.index}.
                  </span>
                  {video.transcript.title?.trim() || video.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {t('playlist.combinedNotes')}
                {notesFromCache && (
                  <span className="ml-2 text-xs font-normal text-emerald-500 dark:text-emerald-400">
                    {t('common.cache')}
                  </span>
                )}
              </p>
              {!notesLoading && (
                <button
                  type="button"
                  onClick={() => void loadCombinedNotes(true)}
                  className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  {t('playlist.regenerateNotes')}
                </button>
              )}
            </div>

            {notesLoading && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {t('playlist.generatingNotes')}
              </p>
            )}

            {notesError && !notesLoading && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {notesError}
              </p>
            )}

            {combinedNotes && !notesLoading && (
              <NotesArticle notes={combinedNotes} t={t} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
