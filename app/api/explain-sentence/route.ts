import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { buildExplainSentencePrompt } from '../../lib/aiPrompts';
import { resolveTaskLanguage } from '../../lib/aiInterfaceLanguage';
import { parseSentenceExplanationResponse } from '../../lib/sentenceExplanation';

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
    const { sentence, taskLanguage, interfaceLanguage } = await request.json();
    const language = resolveTaskLanguage(taskLanguage ?? interfaceLanguage);

    if (!sentence) {
      return NextResponse.json({ error: 'Sentence is required' }, { status: 400 });
    }

    const cleanSentence = sanitizeText(String(sentence));
    if (!cleanSentence) {
      return NextResponse.json({ error: 'Sentence is empty' }, { status: 400 });
    }

    const input = `Sentence:\n${truncateText(cleanSentence, getMaxInputChars())}`;

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
          { role: 'system', content: buildExplainSentencePrompt(language) },
          { role: 'user', content: input },
        ],
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const content = message.choices[0]?.message?.content?.trim();
      if (!content) {
        return NextResponse.json(
          { error: 'OpenAI returned an empty response' },
          { status: 500 }
        );
      }

      const result = parseSentenceExplanationResponse(content);
      if (!result) {
        return NextResponse.json(
          { error: 'Failed to parse sentence explanation' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { error: 'Sentence explanation requires AI_PROVIDER=openai' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error explaining sentence:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to explain sentence',
      },
      { status: 500 }
    );
  }
}
