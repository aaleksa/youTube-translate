import { execSync } from 'child_process';
import { extractPlaylistId } from './youtubeUrl';

export interface PlaylistVideoEntry {
  videoId: string;
  title: string;
  index: number;
}

export interface PlaylistMetadata {
  playlistId: string;
  title: string;
  videos: PlaylistVideoEntry[];
}

const MAX_VIDEOS = Number(process.env.PLAYLIST_MAX_VIDEOS) || 30;

interface YtDlpPlaylistEntry {
  id?: string;
  title?: string;
}

interface YtDlpPlaylistJson {
  title?: string;
  entries?: Array<YtDlpPlaylistEntry | null>;
}

export function fetchPlaylistMetadata(url: string): PlaylistMetadata {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    throw new Error('Invalid playlist URL');
  }

  const output = execSync(
    `yt-dlp --no-warnings -J --flat-playlist --skip-download ${JSON.stringify(url)}`,
    {
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const jsonLine = output
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('{'));

  if (!jsonLine) {
    throw new Error('yt-dlp returned no playlist metadata');
  }

  const data = JSON.parse(jsonLine) as YtDlpPlaylistJson;
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const videos: PlaylistVideoEntry[] = [];

  for (const entry of entries) {
    if (!entry?.id || videos.length >= MAX_VIDEOS) continue;

    videos.push({
      videoId: entry.id,
      title: entry.title?.trim() || entry.id,
      index: videos.length + 1,
    });
  }

  if (videos.length === 0) {
    throw new Error('Playlist has no available videos');
  }

  return {
    playlistId,
    title: data.title?.trim() || playlistId,
    videos,
  };
}
