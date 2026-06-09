import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parsePhrasalVerbsResponse } from '../../lib/phrasalVerbs';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_PHRASAL_VERBS_PROMPT = `You are an English teacher helping Ukrainian learners master phrasal verbs.

Find every phrasal verb in the transcript (verb + particle: up, out, on, off, in, away, back, over, through, etc.).
Include separable and inseparable phrasal verbs as they appear in context.

Return ONLY valid JSON:
{
  "phrasalVerbs": [
    {
      "phrasalVerb": "pick up",
      "meaning": "забрати, підібрати",
      "example": "I'll pick you up at the airport."
    }
  ]
}

Rules:
- meaning: brief explanation in Ukrainian
- example: sentence from the transcript where the phrasal verb appears, or natural example in same context
- List each distinct phrasal verb once (e.g. "pick up" not "picked up" and "pick up" separately unless different meanings)
- Do not include idioms that are not phrasal verbs
- If none found, return { "phrasalVerbs": [] }
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
          { role: 'system', content: FIND_PHRASAL_VERBS_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const phrasalVerbs = parsePhrasalVerbsResponse(raw);

      return NextResponse.json({ success: true, phrasalVerbs });
    }

    return NextResponse.json(
      {
        error:
          'Phrasal verb search currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding phrasal verbs:', error);
    return NextResponse.json(
      { error: 'Failed to find phrasal verbs' },
      { status: 500 }
    );
  }
}
