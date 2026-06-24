import { NextRequest, NextResponse } from 'next/server';
import { aiAccessErrorResponse, enforceAiAccess } from '../_lib/ai-access';
import {
  AI_PROVIDER,
  AI_API_URL,
  callLmStudio,
  callOpenAi,
} from '../../lib/aiChat';
import { resolveTranslationLanguage } from '../../lib/aiInterfaceLanguage';
import { buildEnrichCardPrompt } from '../../lib/aiPrompts';
import { parseCardEnrichment } from '../../lib/flashcardEnrichment';
import type { TranslationLanguageCode } from '../../lib/translationLanguages';

const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;

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

function buildUserInput(options: {
  word: string;
  transcript?: string;
  originalExample?: string;
  fields?: string[];
}): string {
  const lines = [`Word or phrase: ${options.word}`];

  if (options.originalExample?.trim()) {
    lines.push(
      `originalExample (from video subtitles — do NOT replace): ${options.originalExample.trim()}`
    );
  }

  if (options.transcript?.trim()) {
    lines.push(`Transcript excerpt:\n${options.transcript.trim()}`);
  }

  if (options.fields?.length) {
    lines.push(`Requested fields: ${options.fields.join(', ')}`);
  }

  return lines.join('\n\n');
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
    const body = await request.json();
    const word = sanitizeText(String(body.word ?? ''));
    const transcript = body.transcript
      ? sanitizeText(String(body.transcript))
      : undefined;
    const originalExample = body.originalExample
      ? sanitizeText(String(body.originalExample))
      : undefined;
    const fields = Array.isArray(body.fields)
      ? body.fields.filter((field: unknown) => typeof field === 'string')
      : undefined;
    const translationLanguage = resolveTranslationLanguage(
      body.translationLanguage as TranslationLanguageCode | undefined
    );

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const systemPrompt = buildEnrichCardPrompt(translationLanguage);
    const maxChars = getMaxInputChars();
    const input = buildUserInput({
      word,
      transcript: transcript ? truncateText(transcript, maxChars) : undefined,
      originalExample,
      fields,
    });

    let raw = '';
    let model = '';

    if (AI_PROVIDER === 'openai') {
      const response = await callOpenAi(systemPrompt, input, {
        json: true,
        temperature: 0.3,
      });
      raw = response.result;
      model = response.model;
    } else {
      const response = await callLmStudio(systemPrompt, input, {
        temperature: 0.3,
      });
      if (!response.result) {
        return NextResponse.json(
          { error: response.errorText || 'LM Studio returned an empty response' },
          { status: 500 }
        );
      }
      raw = response.result;
      model = response.model;
    }

    const enrichment = parseCardEnrichment(raw);
    if (!enrichment?.translation?.trim()) {
      return NextResponse.json(
        { error: 'AI did not return a valid translation' },
        { status: 500 }
      );
    }

    if (originalExample) {
      delete enrichment.example;
    }

    return NextResponse.json({
      success: true,
      enrichment,
      model,
    });
  } catch (error) {
    console.error('Error enriching flashcard:', error);

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: `Cannot connect to AI API at ${AI_API_URL}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enrich flashcard' },
      { status: 500 }
    );
  }
}
