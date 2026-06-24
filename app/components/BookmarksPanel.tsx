'use client';

import { useEffect, useState } from 'react';
import {
  addBookmark,
  clearBookmarksForVideo,
  getBookmarksForVideo,
  removeBookmark,
  type Bookmark,
} from '../lib/bookmarks';
import { BOOKMARKS_CHANGED_EVENT } from '../lib/dataRefresh';
import {
  findActiveLineIndex,
  formatSecondsToTimestamp,
  parseTimestampToSeconds,
} from '../lib/timestamp';
import { useI18n } from './InterfaceLanguageProvider';

interface TranscriptItem {
  text: string;
  start?: string;
}

interface BookmarksPanelProps {
  videoId: string;
  currentPlaybackTime: number;
  transcript: TranscriptItem[];
  isPlayerReady: boolean;
  onSeek: (seconds: number, lineIndex: number) => void;
}

function buildBookmarkLabel(
  transcript: TranscriptItem[],
  activeLineIndex: number,
  seconds: number
): string {
  const line = transcript[activeLineIndex];
  if (line?.text) {
    const lineStart = parseTimestampToSeconds(line.start);
    if (Math.abs(lineStart - seconds) <= 2) {
      const text = line.text.trim();
      return text.length > 80 ? `${text.slice(0, 77)}...` : text;
    }
  }

  return formatSecondsToTimestamp(seconds);
}

export default function BookmarksPanel({
  videoId,
  currentPlaybackTime,
  transcript,
  isPlayerReady,
  onSeek,
}: BookmarksPanelProps) {
  const { t } = useI18n();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const refresh = () => setBookmarks(getBookmarksForVideo(videoId));
    refresh();
    setFeedback('');

    window.addEventListener(BOOKMARKS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(BOOKMARKS_CHANGED_EVENT, refresh);
  }, [videoId]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(''), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleAdd = () => {
    const seconds = Math.max(0, currentPlaybackTime);
    const activeLineIndex = findActiveLineIndex(transcript, seconds);
    const label = buildBookmarkLabel(transcript, activeLineIndex, seconds);
    const created = addBookmark({ videoId, seconds, label });

    if (!created) {
      setFeedback(t('bookmarks.alreadyExists'));
      return;
    }

    setBookmarks(getBookmarksForVideo(videoId));
    setFeedback(t('bookmarks.added'));
  };

  const handleSeek = (bookmark: Bookmark) => {
    const lineIndex = findActiveLineIndex(transcript, bookmark.seconds);
    onSeek(bookmark.seconds, lineIndex);
  };

  const handleRemove = (id: string) => {
    removeBookmark(id);
    setBookmarks(getBookmarksForVideo(videoId));
  };

  const handleClear = () => {
    clearBookmarksForVideo(videoId);
    setBookmarks([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {t('bookmarks.title', { count: bookmarks.length })}
        </h3>
        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!isPlayerReady}
        className="w-full mb-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
      >
        {t('bookmarks.add', {
          time: formatSecondsToTimestamp(currentPlaybackTime),
        })}
      </button>

      {feedback && (
        <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">{feedback}</p>
      )}

      {bookmarks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          {t('bookmarks.empty')}
        </p>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition border border-transparent hover:border-amber-200 dark:hover:border-amber-900"
            >
              <button
                type="button"
                onClick={() => handleSeek(bookmark)}
                className="flex-1 text-left px-3 py-2 min-w-0"
                title={t('bookmarks.goTo')}
              >
                <span className="block text-xs font-bold text-amber-700 dark:text-amber-300">
                  {formatSecondsToTimestamp(bookmark.seconds)}
                </span>
                <span className="block text-sm text-gray-700 dark:text-gray-300 truncate">
                  {bookmark.label}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRemove(bookmark.id)}
                className="shrink-0 px-3 py-2 text-gray-400 hover:text-red-500 transition"
                aria-label={t('bookmarks.remove')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
