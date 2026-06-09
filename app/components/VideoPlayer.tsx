'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useId,
  useState,
} from 'react';

export interface VideoPlayerState {
  isPlaying: boolean;
  isReady: boolean;
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  pause: () => void;
  play: () => void;
  stop: () => void;
}

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (seconds: number) => void;
  onStateChange?: (state: VideoPlayerState) => void;
}

interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

const YT_STATE_PLAYING = 1;

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
            onStateChange?: (event: { data: number }) => void;
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
  function VideoPlayer({ videoId, onTimeUpdate, onStateChange }, ref) {
    const playerId = useId().replace(/:/g, '');
    const playerRef = useRef<YTPlayer | null>(null);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onStateChangeRef = useRef(onStateChange);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    useEffect(() => {
      onStateChangeRef.current = onStateChange;
    }, [onStateChange]);

    useEffect(() => {
      onStateChangeRef.current?.({ isPlaying, isReady });
    }, [isPlaying, isReady]);

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        if (!playerRef.current) return;
        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo();
        onTimeUpdateRef.current?.(seconds);
      },
      pause() {
        playerRef.current?.pauseVideo();
      },
      play() {
        playerRef.current?.playVideo();
      },
      stop() {
        if (!playerRef.current) return;
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(0, true);
        onTimeUpdateRef.current?.(0);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setIsReady(false);
      setIsPlaying(false);

      loadYouTubeApi().then(() => {
        if (cancelled || !window.YT?.Player) return;

        playerRef.current?.destroy();
        playerRef.current = new window.YT.Player(playerId, {
          videoId,
          height: '100%',
          width: '100%',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
          },
          events: {
            onReady: () => {
              if (!cancelled) setIsReady(true);
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === YT_STATE_PLAYING);
            },
          },
        });
      });

      return () => {
        cancelled = true;
        playerRef.current?.destroy();
        playerRef.current = null;
      };
    }, [videoId, playerId]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (!playerRef.current) return;
        try {
          const time = playerRef.current.getCurrentTime();
          if (Number.isFinite(time)) {
            onTimeUpdateRef.current?.(time);
          }
        } catch {
          // Player not ready yet
        }
      }, 250);

      return () => clearInterval(interval);
    }, [videoId]);

    return (
      <div className="w-full aspect-video max-h-[min(400px,70dvh)] bg-black">
        <div id={playerId} className="w-full h-full min-h-[180px]" />
      </div>
    );
  }
);

export default VideoPlayer;
