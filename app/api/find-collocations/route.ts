import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseCollocationsResponse } from '../../lib/collocations';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_COLLOCATIONS_PROMPT = `You are an English teacher helping Ukrainian learners at B1+ level master collocations.

Find natural word combinations (collocations) in the transcript — pairs or short groups of words that native speakers habitually use together.

Examples of what TO include:
- make a decision, take a break, do homework
- heavy rain, strong coffee, deep sleep
- highly recommend, widely used, fully aware
- pay attention, catch a cold, run a business

Examples of what NOT to include:
- idioms with non-literal meaning (piece of cake) — those are idioms
- phrasal verbs (give up, look into) — those are phrasal verbs
- discourse phrases (by the way, I mean) — those are useful phrases
- slang or crude informal expressions
- single words without a collocation partner

Return ONLY valid JSON:
{
  "collocations": [
    {
      "collocation": "make a decision",
      "meaning": "прийняти рішення",
      "example": "We need to make a decision by Friday."
    }
  ]
}

Rules:
- collocation: 2–4 words that naturally go together
- meaning: brief explanation in Ukrainian
- example: sentence from the transcript where the collocation appears, or natural example in same context
- List each distinct collocation once
- If none found, return { "collocations": [] }
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
          { role: 'system', content: FIND_COLLOCATIONS_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const collocations = parseCollocationsResponse(raw);

      return NextResponse.json({ success: true, collocations });
    }

    return NextResponse.json(
      {
        error:
          'Collocation search currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding collocations:', error);
    return NextResponse.json(
      { error: 'Failed to find collocations' },
      { status: 500 }
    );
  }
}
