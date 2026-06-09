import { NextRequest, NextResponse } from 'next/server';
import {
  extractVideoId,
  pickDefaultLanguage,
  tryLoadAvailableLanguages,
} from '../../../lib/youtubeSubtitles';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const availableLanguages = tryLoadAvailableLanguages(url);
    const defaultLanguage = pickDefaultLanguage(availableLanguages);

    return NextResponse.json({
      videoId,
      availableLanguages,
      defaultLanguage,
    });
  } catch (error) {
    console.error('Error listing subtitle languages:', error);
    return NextResponse.json(
      { error: 'Failed to list subtitle languages' },
      { status: 500 }
    );
  }
}
