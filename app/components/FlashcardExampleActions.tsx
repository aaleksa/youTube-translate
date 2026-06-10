'use client';

import { resolveFlashcardSentence, type Flashcard } from '../lib/flashcards';
import { buildVideoWatchUrl } from '../lib/youtubeUrl';
import type { StoredSentence } from '../lib/sentenceStore';
import { useI18n } from './InterfaceLanguageProvider';

export interface FlashcardSentenceHandlers {
  onListenSentence?: (sentence: StoredSentence) => void;
  onWatchExample?: (sentence: StoredSentence) => void;
  onRepeatSentence?: (sentence: StoredSentence) => void;
  onShadowSentence?: (sentence: StoredSentence) => void;
}

interface FlashcardExampleActionsProps extends FlashcardSentenceHandlers {
  card: Flashcard;
  activeVideoId?: string;
  compact?: boolean;
}

export default function FlashcardExampleActions({
  card,
  activeVideoId,
  compact = false,
  onListenSentence,
  onWatchExample,
  onRepeatSentence,
  onShadowSentence,
}: FlashcardExampleActionsProps) {
  const { t } = useI18n();
  const sentence = resolveFlashcardSentence(card);

  if (!sentence) return null;

  const canUseInApp =
    Boolean(sentence.videoId) &&
    activeVideoId === sentence.videoId &&
    Boolean(onListenSentence || onWatchExample || onRepeatSentence);

  const watchUrl = `${buildVideoWatchUrl(sentence.videoId)}&t=${Math.floor(sentence.startTime)}`;

  const buttonClass = compact
    ? 'inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline'
    : 'min-h-10 px-3 py-2 rounded-lg text-sm font-semibold transition border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950/60';

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center justify-center gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 gap-2'
      }
    >
      {canUseInApp && onListenSentence ? (
        <button
          type="button"
          onClick={() => onListenSentence(sentence)}
          className={buttonClass}
        >
          {t('flashcards.listenSentence')}
        </button>
      ) : (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          {t('flashcards.listenSentence')}
        </a>
      )}

      {canUseInApp && onWatchExample ? (
        <button
          type="button"
          onClick={() => onWatchExample(sentence)}
          className={buttonClass}
        >
          {t('flashcards.watchExample')}
        </button>
      ) : (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          {t('flashcards.watchExample')}
        </a>
      )}

      {canUseInApp && onRepeatSentence ? (
        <button
          type="button"
          onClick={() => onRepeatSentence(sentence)}
          className={buttonClass}
        >
          {t('flashcards.repeatSentenceX3')}
        </button>
      ) : (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          {t('flashcards.repeatSentenceX3')}
        </a>
      )}

      {canUseInApp && onShadowSentence ? (
        <button
          type="button"
          onClick={() => onShadowSentence(sentence)}
          className={buttonClass}
        >
          {t('flashcards.shadowSentence')}
        </button>
      ) : null}
    </div>
  );
}
