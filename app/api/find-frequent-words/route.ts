import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { aiAccessErrorResponse, enforceAiAccess } from '../_lib/ai-access';
import { resolveTranslationLanguage } from '../../lib/aiInterfaceLanguage';
import { buildFrequentWordsPrompt } from '../../lib/aiPrompts';
import {
  countFrequentWords,
  mergeFrequentWords,
  parseFrequentWordsTranslations,
} from '../../lib/frequentWords';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
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
    const { text, translationLanguage } = await request.json();
    const lang = resolveTranslationLanguage(translationLanguage);
    const systemPrompt = buildFrequentWordsPrompt(lang);

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = sanitizeText(String(text));
    if (!cleanText) {
      return NextResponse.json({ error: 'Text is empty' }, { status: 400 });
    }

    const wordCounts = countFrequentWords(cleanText);

    if (wordCounts.length === 0) {
      return NextResponse.json({ success: true, frequentWords: [] });
    }

    if (AI_PROVIDER === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY is not configured' },
          { status: 500 }
        );
      }

      const wordList = wordCounts
        .map(({ word, count }) => `${word} (${count}×)`)
        .join('\n');

      const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const message = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Words to translate:\n${wordList}`,
          },
        ],
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const translations = parseFrequentWordsTranslations(raw);
      const frequentWords = mergeFrequentWords(
        wordCounts,
        translations,
        cleanText
      );

      return NextResponse.json({ success: true, frequentWords });
    }

    return NextResponse.json(
      {
        error:
          'Frequent words search currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding frequent words:', error);
    return NextResponse.json(
      { error: 'Failed to find frequent words' },
      { status: 500 }
    );
  }
}
