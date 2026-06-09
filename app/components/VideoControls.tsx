'use client';

import { useI18n } from './InterfaceLanguageProvider';

interface VideoControlsProps {
  isPlaying: boolean;
  isReady: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  className?: string;
}

export default function VideoControls({
  isPlaying,
  isReady,
  onPlayPause,
  onStop,
  className = '',
}: VideoControlsProps) {
  const { t } = useI18n();

  return (
    <div className={`flex gap-2 p-3 bg-gray-900 ${className}`}>
      <button
        type="button"
        onClick={onPlayPause}
        disabled={!isReady}
        className="flex-1 min-h-11 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
      >
        {isPlaying ? t('video.pause') : t('video.play')}
      </button>
      <button
        type="button"
        onClick={onStop}
        disabled={!isReady}
        className="min-h-11 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
      >
        {t('video.stop')}
      </button>
    </div>
  );
}
