import type { TranscriptCacheData } from './transcriptCache';

export interface PlaylistVideoWithTranscript {
  videoId: string;
  title: string;
  index: number;
  transcript: TranscriptCacheData;
}

export function buildCombinedTranscriptText(
  items: PlaylistVideoWithTranscript[],
  playlistTitle: string
): string {
  const header = `Playlist: ${playlistTitle}\nVideos: ${items.length}`;
  const body = items
    .map((item) => {
      const title = item.transcript.title?.trim() || item.title;
      return `--- Video ${item.index}: ${title} (${item.videoId}) ---\n${item.transcript.text}`;
    })
    .join('\n\n');

  return `${header}\n\n${body}`;
}
