import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseSummaryResponse } from '../../lib/videoSummary';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 1024;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SUMMARY_PROMPT = `You are a concise summarizer for Ukrainian learners watching English YouTube videos.

Create a short summary of what the video is about — readable in about 30 seconds.

Return ONLY valid JSON:
{
  "summary": "2-4 речення українською: про що відео, головна ідея, ключові моменти."
}

Rules:
- Write summary in Ukrainian
- Be clear and structured; no bullet points inside the string
- Preserve tone and main message of the transcript
- Do not invent facts not present in the transcript
- No text outside JSON`;

function sanitizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function getMaxInputChars(): number {
  return AI_PROVIDER === 'openai'
    ? OPENAI_MAX_INPUT_CHARS
    : LMSTUDIO_MAX_INPUT_CHARS;
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = sanitizeText(String(text));
    if (!cleanText) {
      return NextResponse.json({ error: 'Text is empty' }, { status: 400 });
    }

    const input = `Transcript:\n${truncateText(cleanText, getMaxInputChars())}`;

    if (AI_PROVIDER === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY is not configured' },
          { status: 500 }
        );
      }

      const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const message = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SUMMARY_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const parsed = parseSummaryResponse(raw);

      if (!parsed) {
        return NextResponse.json(
          { error: 'Failed to parse summary' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, ...parsed });
    }

    return NextResponse.json(
      { error: 'Summary currently requires OpenAI (AI_PROVIDER=openai)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
