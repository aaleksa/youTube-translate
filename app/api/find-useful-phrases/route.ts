import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseUsefulPhrasesResponse } from '../../lib/usefulPhrases';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_USEFUL_PHRASES_PROMPT = `You are an English teacher helping Ukrainian learners master natural spoken English.

Find fixed expressions and useful conversational phrases in the transcript.
These are standard phrases speakers use to connect ideas, soften speech, or structure conversation.

Examples of what TO include:
- by the way, I mean, as far as I know, to be honest
- in other words, on the other hand, at the end of the day
- kind of, sort of (when used as discourse markers)
- you know what I mean, the thing is, it depends

Examples of what NOT to include:
- idioms with non-literal meaning (piece of cake, break the ice) — those are idioms
- phrasal verbs (give up, pick up, look into) — those are phrasal verbs
- slang or very informal/crude expressions — those are slang
- single common words without a fixed phrase pattern

Return ONLY valid JSON:
{
  "phrases": [
    {
      "phrase": "by the way",
      "meaning": "до речі",
      "example": "By the way, I forgot to mention the meeting."
    }
  ]
}

Rules:
- meaning: brief explanation in Ukrainian
- example: sentence from the transcript where the phrase appears, or natural example in same context
- List each distinct phrase once
- If none found, return { "phrases": [] }
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
          { role: 'system', content: FIND_USEFUL_PHRASES_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const phrases = parseUsefulPhrasesResponse(raw);

      return NextResponse.json({ success: true, phrases });
    }

    return NextResponse.json(
      {
        error:
          'Useful phrases search currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding useful phrases:', error);
    return NextResponse.json(
      { error: 'Failed to find useful phrases' },
      { status: 500 }
    );
  }
}
