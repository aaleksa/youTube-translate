import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { aiAccessErrorResponse, enforceAiAccess } from '../_lib/ai-access';
import { buildDifficultyPrompt } from '../../lib/aiPrompts';
import { resolveTaskLanguage } from '../../lib/aiInterfaceLanguage';
import { parseDifficultyResponse } from '../../lib/cefrLevel';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 1024;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    await enforceAiAccess(request);
  } catch (error) {
    const accessError = aiAccessErrorResponse(error);
    if (accessError) return accessError;
    throw error;
  }

  try {
    const { text, taskLanguage, interfaceLanguage } = await request.json();
    const language = resolveTaskLanguage(taskLanguage ?? interfaceLanguage);

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
          { role: 'system', content: buildDifficultyPrompt(language) },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const parsed = parseDifficultyResponse(raw);

      if (!parsed) {
        return NextResponse.json(
          { error: 'Failed to parse difficulty assessment' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, ...parsed });
    }

    return NextResponse.json(
      { error: 'CEFR analysis currently requires OpenAI (AI_PROVIDER=openai)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error assessing video difficulty:', error);
    return NextResponse.json(
      { error: 'Failed to assess video difficulty' },
      { status: 500 }
    );
  }
}
