import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaylistMetadata } from '../../lib/youtubePlaylist';
import { isPlaylistUrl } from '../../lib/youtubeUrl';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Playlist URL is required' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    if (!isPlaylistUrl(trimmedUrl)) {
      return NextResponse.json(
        { error: 'Invalid playlist URL' },
        { status: 400 }
      );
    }

    const playlist = fetchPlaylistMetadata(trimmedUrl);

    return NextResponse.json({ success: true, ...playlist });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch playlist';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
