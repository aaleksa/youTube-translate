'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useId,
} from 'react';

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  videoId: string;
}

interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          height?: string | number;
          width?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoId }, ref) {
    const playerId = useId().replace(/:/g, '');
    const playerRef = useRef<YTPlayer | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        if (!playerRef.current) return;
        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo();
      },
    }));

    useEffect(() => {
      let cancelled = false;

      loadYouTubeApi().then(() => {
        if (cancelled || !window.YT?.Player) return;

        playerRef.current?.destroy();
        playerRef.current = new window.YT.Player(playerId, {
          videoId,
          height: '400',
          width: '100%',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
          },
        });
      });

      return () => {
        cancelled = true;
        playerRef.current?.destroy();
        playerRef.current = null;
      };
    }, [videoId, playerId]);

    return (
      <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
        <div id={playerId} className="w-full aspect-video max-h-[400px]" />
      </div>
    );
  }
);

export default VideoPlayer;
