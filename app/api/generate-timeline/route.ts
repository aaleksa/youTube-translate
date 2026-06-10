import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { buildTimelinePrompt } from '../../lib/aiPrompts';
import { resolveTaskLanguage } from '../../lib/aiInterfaceLanguage';
import {
  formatTranscriptForTimeline,
  parseTimelineResponse,
} from '../../lib/videoTimeline';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { transcript, taskLanguage, interfaceLanguage } = await request.json();
    const language = resolveTaskLanguage(taskLanguage ?? interfaceLanguage);

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Transcript with timestamps is required' },
        { status: 400 }
      );
    }

    const formatted = formatTranscriptForTimeline(
      transcript as Array<{ text: string; start?: string }>
    );

    if (!formatted.trim()) {
      return NextResponse.json({ error: 'Transcript is empty' }, { status: 400 });
    }

    const input = `Timestamped transcript:\n${truncateText(formatted, getMaxInputChars())}`;

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
          { role: 'system', content: buildTimelinePrompt(language) },
          { role: 'user', content: input },
        ],
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const parsed = parseTimelineResponse(raw);

      if (!parsed) {
        return NextResponse.json(
          { error: 'Failed to parse timeline' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, moments: parsed.moments });
    }

    return NextResponse.json(
      {
        error: 'Timeline generation currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error generating timeline:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}
