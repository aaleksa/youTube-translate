import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseSlangResponse } from '../../lib/slang';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_SLANG_PROMPT = `You are an English teacher helping Ukrainian learners understand slang and informal language.

Find slang words, informal expressions, colloquialisms, and casual speech in the transcript. Include:
- internet slang and abbreviations (gonna, kinda, lit, vibe)
- colloquial words (bucks, cool, awesome used informally)
- informal phrases typical of spoken English
- regional or youth slang when present

Return ONLY valid JSON:
{
  "slang": [
    {
      "expression": "gonna",
      "meaning": "going to — збираюся, буду",
      "formality": "informal",
      "example": "I'm gonna grab a taxi."
    }
  ]
}

Rules:
- meaning: brief explanation AND Ukrainian translation
- formality: one of: formal, neutral, informal, very informal, slang, vulgar
- example: sentence from the transcript or natural example in same context
- Do NOT include standard phrasal verbs or idioms unless clearly slang/colloquial
- If nothing found, return { "slang": [] }
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
          { role: 'system', content: FIND_SLANG_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const slang = parseSlangResponse(raw);

      return NextResponse.json({ success: true, slang });
    }

    return NextResponse.json(
      { error: 'Slang search currently requires OpenAI (AI_PROVIDER=openai)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding slang:', error);
    return NextResponse.json(
      { error: 'Failed to find slang' },
      { status: 500 }
    );
  }
}
