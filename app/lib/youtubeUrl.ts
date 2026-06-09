export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function extractPlaylistId(url: string): string | null {
  const trimmed = url.trim();
  const listMatch = trimmed.match(/[?&]list=([^&\n?#]+)/);
  if (listMatch) return listMatch[1];

  const playlistMatch = trimmed.match(
    /youtube\.com\/playlist\?list=([^&\n?#]+)/
  );
  if (playlistMatch) return playlistMatch[1];

  return null;
}

export function isPlaylistUrl(url: string): boolean {
  return extractPlaylistId(url) !== null;
}

export function buildVideoWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
