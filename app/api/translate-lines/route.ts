import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslationLanguageName } from '../../lib/translationLanguages';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_LINES_PER_REQUEST = 50;

function sanitizeLine(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

async function translateChunk(
  lines: string[],
  targetLanguage: string
): Promise<string[]> {
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const targetName = getTranslationLanguageName(targetLanguage);
  const numbered = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator for language learners watching English videos.
Translate each numbered English transcript line into ${targetName} (language code: ${targetLanguage}).
Return JSON only: {"translations":["translation of line 1","translation of line 2",...]}
The translations array MUST have exactly ${lines.length} items in the same order.
Keep the meaning natural. Do not merge or split lines.`,
      },
      {
        role: 'user',
        content: numbered,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty translation response');
  }

  const parsed = JSON.parse(content) as { translations?: unknown };
  if (!Array.isArray(parsed.translations)) {
    throw new Error('Invalid translation format');
  }

  const translations = parsed.translations.map((item) =>
    typeof item === 'string' ? item.trim() : ''
  );

  while (translations.length < lines.length) {
    translations.push('');
  }

  return translations.slice(0, lines.length);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { lines, targetLanguage = 'uk' } = await request.json();
    const language =
      typeof targetLanguage === 'string' && targetLanguage.trim()
        ? targetLanguage.trim()
        : 'uk';

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'lines array is required' },
        { status: 400 }
      );
    }

    if (lines.length > MAX_LINES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_LINES_PER_REQUEST} lines per request` },
        { status: 400 }
      );
    }

    const cleanLines = lines.map((line) => sanitizeLine(String(line)));
    const translations = await translateChunk(cleanLines, language);

    return NextResponse.json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error('Error translating lines:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to translate lines',
      },
      { status: 500 }
    );
  }
}
