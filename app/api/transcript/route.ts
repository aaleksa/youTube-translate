import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { processTranscript } from '../../lib/normalizeCaptions';
import { cleanTranscriptText } from '../../lib/transcriptText';
import { ensureTranscriptTimestamps } from '../../lib/timestamp';
import {
  extractVideoId,
  extractVideoMetadata,
  fetchSubtitleContent,
  fetchVideoMetadata,
  getAvailableLanguages,
  getSubtitleVttUrl,
  parseLanguageFromSubtitleFilename,
  pickDefaultLanguage,
  type ExtractedVideoMetadata,
  type SubtitleLanguage,
} from '../../lib/youtubeSubtitles';

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;
  
  try {
    const { url, lang } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const titleFromOembed = await fetchVideoTitle(url);
    let availableLanguages: SubtitleLanguage[] = [];
    let extractedMetadata: ExtractedVideoMetadata = {};

    try {
      const metadata = fetchVideoMetadata(url);
      extractedMetadata = extractVideoMetadata(metadata);
      availableLanguages = getAvailableLanguages(metadata);
      const title = extractedMetadata.title ?? titleFromOembed;
      const selectedLanguage =
        typeof lang === 'string' && lang.trim()
          ? lang.trim()
          : pickDefaultLanguage(availableLanguages);

      if (selectedLanguage) {
        const vttUrl = getSubtitleVttUrl(metadata, selectedLanguage);
        if (vttUrl) {
          const vttContent = await fetchSubtitleContent(vttUrl);
          const transcript = parseVTTTranscript(vttContent);

          if (transcript.length > 0) {
            return formatSuccessResponse(videoId, transcript, {
              title,
              channelName: extractedMetadata.channelName,
              durationSeconds: extractedMetadata.durationSeconds,
              availableLanguages,
              selectedLanguage,
            });
          }
        }
      }
    } catch (metadataError) {
      console.log('Metadata subtitle fetch failed, using fallback:', metadataError);
    }

    const title = extractedMetadata.title ?? titleFromOembed;

    // Create a temporary directory for transcript files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-transcript-'));
    
    // Use yt-dlp to download subtitles in JSON format
    const transcriptPath = path.join(tempDir, 'subtitle');
    
    try {
      // First, try to download automatic captions
      let command = `yt-dlp --write-auto-subs --sub-format "vtt/srt" --skip-download -o "${transcriptPath}" "${url}" 2>&1`;
      
      try {
        const output = execSync(command, { 
          stdio: 'pipe', 
          maxBuffer: 10 * 1024 * 1024,
          encoding: 'utf-8'
        }).toString();
        console.log('yt-dlp output:', output);
      } catch (e: any) {
        console.log('yt-dlp stderr/output:', e.stdout || e.stderr || e.message);
      }
      
      // Look for the downloaded subtitle file (any format)
      let files = fs.readdirSync(tempDir);
      console.log('Files in temp dir:', files);
      
      // Try automatic captions first (contain 'en' and subtitle format)
      let subtitleFile = files.find(f => 
        f.includes('en') && 
        (f.endsWith('.vtt') || f.endsWith('.srt') || f.endsWith('.json'))
      );
      
      // If no auto-captions, try manual captions
      if (!subtitleFile) {
        subtitleFile = files.find(f => 
          (f.endsWith('.vtt') || f.endsWith('.srt') || f.endsWith('.json')) &&
          !f.startsWith('.')
        );
      }
      
      if (!subtitleFile) {
        console.log('No subtitle files found. Attempting to check available formats...');
        
        // Try to list available subtitles
        try {
          const listOutput = execSync(
            `yt-dlp --list-subs "${url}" 2>&1 | head -20`,
            { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 1024 * 1024 }
          ).toString();
          console.log('Available subtitles:', listOutput);
        } catch (e) {
          console.log('Could not list available subtitles');
        }
        
        // Fallback to manual methods
        const fallbackTranscript = await fetchTranscriptFallback(videoId);
        if (fallbackTranscript.length > 0) {
          return formatSuccessResponse(videoId, fallbackTranscript, {
            title,
            channelName: extractedMetadata.channelName,
            durationSeconds: extractedMetadata.durationSeconds,
            availableLanguages,
            selectedLanguage: pickDefaultLanguage(availableLanguages) ?? 'en',
          });
        }

        return NextResponse.json(
          {
            error:
              "No captions found for this video. Try:\n1. Check if the video has captions enabled on YouTube\n2. Use a video with manually added or auto-generated captions\n3. Check the video's language settings",
          },
          { status: 400 }
        );
      }
      
      const subtitlePath = path.join(tempDir, subtitleFile);
      const subtitleContent = fs.readFileSync(subtitlePath, 'utf-8');
      
      let transcript: any[] = [];
      
      if (subtitleFile.endsWith('.json')) {
        // Parse JSON format
        const subtitleData = JSON.parse(subtitleContent);
        if (subtitleData.events) {
          for (const event of subtitleData.events) {
            if (event.tText) {
              transcript.push({
                text: event.tText.replace(/\n/g, ' ').trim(),
                start: event.tStartMs ? (event.tStartMs / 1000).toString() : '',
                duration: event.dDurationMs ? (event.dDurationMs / 1000).toString() : ''
              });
            }
          }
        }
      } else if (subtitleFile.endsWith('.vtt')) {
        // Parse VTT format
        transcript = parseVTTTranscript(subtitleContent);
      } else if (subtitleFile.endsWith('.srt')) {
        // Parse SRT format
        transcript = parseSRTTranscript(subtitleContent);
      }
      
      if (transcript.length === 0) {
        console.log('Transcript parsing returned 0 items');
        const fallbackTranscript = await fetchTranscriptFallback(videoId);
        if (fallbackTranscript.length > 0) {
          return formatSuccessResponse(videoId, fallbackTranscript, {
            title,
            channelName: extractedMetadata.channelName,
            durationSeconds: extractedMetadata.durationSeconds,
            availableLanguages,
            selectedLanguage: pickDefaultLanguage(availableLanguages) ?? 'en',
          });
        }

        return NextResponse.json(
          { error: 'Caption file was empty or could not be parsed. This video may not have usable captions.' },
          { status: 400 }
        );
      }

      const fileLanguage =
        parseLanguageFromSubtitleFilename(subtitleFile) ??
        pickDefaultLanguage(availableLanguages) ??
        'en';

      return formatSuccessResponse(videoId, transcript, {
        title,
        channelName: extractedMetadata.channelName,
        durationSeconds: extractedMetadata.durationSeconds,
        availableLanguages,
        selectedLanguage: fileLanguage,
      });

    } catch (execError) {
      console.error('yt-dlp execution error:', execError);
      
      // Fallback to manual methods
      const fallbackTranscript = await fetchTranscriptFallback(videoId);
      if (fallbackTranscript.length > 0) {
        return formatSuccessResponse(videoId, fallbackTranscript, {
          title,
          channelName: extractedMetadata.channelName,
          durationSeconds: extractedMetadata.durationSeconds,
          availableLanguages,
          selectedLanguage: pickDefaultLanguage(availableLanguages) ?? 'en',
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch transcript. Please ensure the video has captions enabled.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
  }
}

async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { title?: string };
    const title = data.title?.trim();
    return title || null;
  } catch {
    return null;
  }
}

interface TranscriptSuccessOptions {
  title?: string | null;
  channelName?: string;
  durationSeconds?: number;
  availableLanguages?: SubtitleLanguage[];
  selectedLanguage?: string;
}

function formatSuccessResponse(
  videoId: string,
  transcript: any[],
  options: TranscriptSuccessOptions = {}
) {
  const {
    title,
    channelName,
    durationSeconds,
    availableLanguages = [],
    selectedLanguage,
  } = options;

  const normalizedTranscript = ensureTranscriptTimestamps(
    transcript
      .map((item: any) => ({
        text: cleanTranscriptText(String(item.text || item)),
        start: item.start?.toString() || '',
        duration: item.duration?.toString() || '',
      }))
      .filter((item) => item.text)
  );

  const processed = processTranscript(normalizedTranscript);
  const fullText =
    processed.sentenceText ||
    normalizedTranscript.map((item) => item.text).join(' ');
  const selectedSubtitle = availableLanguages.find(
    (language) => language.code === selectedLanguage
  );

  return NextResponse.json({
    videoId,
    title: title?.trim() || videoId,
    ...(channelName ? { channelName } : {}),
    ...(typeof durationSeconds === 'number' && durationSeconds > 0
      ? { durationSeconds }
      : {}),
    transcript: normalizedTranscript,
    rawCaptions: processed.rawCaptions,
    sentences: processed.sentences,
    phrases: processed.phrases,
    text: fullText,
    availableLanguages,
    ...(selectedLanguage ? { selectedLanguage } : {}),
    ...(selectedSubtitle
      ? {
          subtitleLanguageName: selectedSubtitle.name,
          subtitleLanguageKind: selectedSubtitle.kind,
        }
      : selectedLanguage
        ? { subtitleLanguageName: selectedLanguage }
        : {}),
  });
}

interface TranscriptEntry {
  text: string;
  start?: string;
  duration?: string;
}

async function fetchTranscriptMethod1(videoId: string): Promise<TranscriptEntry[]> {
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    if (response.ok) {
      const xml = await response.text();
      return parseXmlTranscript(xml);
    }
  } catch (error) {
    console.error('Method 1 error:', error);
  }
  return [];
}

async function fetchTranscriptMethod2(videoId: string): Promise<TranscriptEntry[]> {
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    if (response.ok) {
      const xml = await response.text();
      return parseXmlTranscript(xml);
    }
  } catch (error) {
    console.error('Method 2 error:', error);
  }
  return [];
}

async function fetchTranscriptMethod3(videoId: string): Promise<TranscriptEntry[]> {
  try {
    // Fetch YouTube page to extract caption track URL from page data
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.log('YouTube page fetch failed:', response.status);
      return [];
    }

    const html = await response.text();
    
    // Look for the captions in the page's initialData JSON
    const initialDataMatch = html.match(/'captionTracks':\s*\[(.*?)\]/);
    if (!initialDataMatch) {
      console.log('No caption tracks found in page');
      
      // Try alternative: fetch using direct timedtext API with different approach
      return await tryDirectCaptionFetch(videoId);
    }

    // Extract all baseUrls from captionTracks
    const baseUrlMatches = html.match(/'baseUrl':'([^']+)'/g) || [];
    
    if (baseUrlMatches.length === 0) {
      console.log('No baseUrl found in caption tracks');
      return await tryDirectCaptionFetch(videoId);
    }

    // Get the first caption URL
    const firstMatch = baseUrlMatches[0];
    if (!firstMatch) {
      return await tryDirectCaptionFetch(videoId);
    }
    const captionUrl = firstMatch
      .replace(/'baseUrl':'/, '')
      .replace(/'$/, '')
      .replace(/\\/g, '');

    console.log('Extracted caption URL:', captionUrl);
    
    if (!captionUrl || captionUrl.includes('csi_')) {
      return await tryDirectCaptionFetch(videoId);
    }
    
    const captionResponse = await fetch(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!captionResponse.ok) {
      console.log('Caption fetch failed:', captionResponse.status);
      return await tryDirectCaptionFetch(videoId);
    }

    const xml = await captionResponse.text();
    if (xml.includes('<text')) {
      return parseXmlTranscript(xml);
    }
    
    return await tryDirectCaptionFetch(videoId);
  } catch (error) {
    console.error('Method 3 error:', error);
    return await tryDirectCaptionFetch(videoId);
  }
}

async function tryDirectCaptionFetch(videoId: string): Promise<TranscriptEntry[]> {
  try {
    // Try to get the caption list first
    const listResponse = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (listResponse.ok) {
      const listXml = await listResponse.text();
      
      // Try to extract track elements and get the first one
      const trackMatch = listXml.match(/<track[^>]*>/);
      if (trackMatch) {
        const hrefMatch = trackMatch[0].match(/href="([^"]+)"/);
        if (hrefMatch) {
          const captionUrl = hrefMatch[1];
          console.log('Found caption from list:', captionUrl);
          
          const captionResponse = await fetch(captionUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          if (captionResponse.ok) {
            const xml = await captionResponse.text();
            const parsed = parseXmlTranscript(xml);
            if (parsed.length > 0) {
              return parsed;
            }
          }
        }
      }
    }

    // Last resort: try with different language codes
    const langs = ['en', 'en-US', 'en-GB'];
    for (const lang of langs) {
      const response = await fetch(
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );

      if (response.ok) {
        const xml = await response.text();
        const parsed = parseXmlTranscript(xml);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    }

    return [];
  } catch (error) {
    console.error('tryDirectCaptionFetch error:', error);
    return [];
  }
}

function parseXmlTranscript(xml: string): TranscriptEntry[] {
  try {
    if (!xml || typeof xml !== 'string') {
      return [];
    }

    // Extract all text elements from XML
    const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g) || [];
    
    if (textMatches.length === 0) {
      console.log('No text matches found in XML');
      return [];
    }

    const transcript: TranscriptEntry[] = [];
    
    for (const match of textMatches) {
      try {
        // Extract text content between tags
        const textContent = match
          .replace(/<text[^>]*>/g, '')
          .replace(/<\/text>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'");

        if (textContent.trim()) {
          transcript.push({
            text: textContent.trim(),
          });
        }
      } catch (e) {
        console.error('Error parsing text element:', e);
      }
    }

    console.log(`Parsed ${transcript.length} transcript entries`);
    return transcript;
  } catch (error) {
    console.error('Error parsing XML transcript:', error);
    return [];
  }
}

async function fetchTranscriptFallback(videoId: string): Promise<any[]> {
  try {
    // Try method 1: Direct YouTube API with language parameter
    let transcript = await fetchTranscriptMethod1(videoId);
    if (transcript && transcript.length > 0) {
      return transcript;
    }
    
    // Try method 2: YouTube API without language parameter
    transcript = await fetchTranscriptMethod2(videoId);
    if (transcript && transcript.length > 0) {
      return transcript;
    }
    
    // Try method 3: From YouTube page HTML
    transcript = await fetchTranscriptMethod3(videoId);
    if (transcript && transcript.length > 0) {
      return transcript;
    }
    
    return [];
  } catch (error) {
    console.error('Fallback fetch error:', error);
    return [];
  }
}

function parseVTTTranscript(vttContent: string): TranscriptEntry[] {
  const transcript: TranscriptEntry[] = [];
  
  // Split by double newlines to get cues
  const cues = vttContent.split('\n\n');
  
  for (const cue of cues) {
    const lines = cue.trim().split('\n');
    
    // Skip header or empty cues
    if (lines.length < 2) continue;
    
    // Find the timing line (contains -->)
    let timingLine = '';
    let textStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLine = lines[i];
        textStart = i + 1;
        break;
      }
    }
    
    if (!timingLine) continue;
    
    // Extract start and end timestamps
    const parts = timingLine.split('-->').map(p => p.trim());
    let startTime = '';
    let endTime = '';
    
    if (parts[0]) {
      // Normalize timestamp format (remove milliseconds separator variations)
      startTime = parts[0].replace(',', '.');
    }
    
    if (parts[1]) {
      endTime = parts[1].replace(',', '.').split(/\s/)[0]; // Remove any extra data after time
    }
    
    // Extract text (everything after timing line)
    const textLines = lines.slice(textStart).join(' ').trim();
    
    // Remove HTML tags and clean up
    const cleanText = textLines
      .replace(/<[^>]+>/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    if (cleanText) {
      transcript.push({
        text: cleanText,
        start: startTime,
        duration: endTime
      });
    }
  }
  
  return transcript;
}

function parseSRTTranscript(srtContent: string): TranscriptEntry[] {
  const transcript: TranscriptEntry[] = [];
  
  // Split by double newlines to get subtitle blocks
  const blocks = srtContent.split('\n\n');
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    
    if (lines.length < 2) continue;
    
    // First line is usually the sequence number, skip it
    // Second line contains timing
    const timingLine = lines[1];
    
    if (!timingLine || !timingLine.includes('-->')) {
      continue;
    }
    
    // Extract start and end times from SRT format (HH:MM:SS,mmm --> HH:MM:SS,mmm)
    const parts = timingLine.split('-->').map(p => p.trim());
    let startTime = '';
    let endTime = '';
    
    if (parts[0]) {
      startTime = parts[0].replace(',', '.');
    }
    
    if (parts[1]) {
      endTime = parts[1].replace(',', '.').split(/\s/)[0]; // Remove any extra data
    }
    
    // Extract text (everything after timing line)
    const textLines = lines.slice(2).join(' ').trim();
    
    if (textLines) {
      transcript.push({
        text: textLines,
        start: startTime,
        duration: endTime
      });
    }
  }
  
  return transcript;
}
