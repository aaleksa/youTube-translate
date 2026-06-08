'use client';

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
  return (
    <div className={`flex gap-2 p-3 bg-gray-900 ${className}`}>
      <button
        type="button"
        onClick={onPlayPause}
        disabled={!isReady}
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
      >
        {isPlaying ? '⏸ Пауза' : '▶️ Грати'}
      </button>
      <button
        type="button"
        onClick={onStop}
        disabled={!isReady}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition text-sm font-medium"
      >
        ⏹ Стоп
      </button>
    </div>
  );
}
