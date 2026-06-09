import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseIdiomsResponse } from '../../lib/idioms';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_IDIOMS_PROMPT = `You are an English teacher helping Ukrainian learners understand idioms.

Find every idiom and idiomatic expression in the transcript. Include:
- common idioms (break the ice, piece of cake)
- fixed expressions and sayings
- culturally idiomatic phrases (not literal word combinations)

Return ONLY valid JSON:
{
  "idioms": [
    {
      "idiom": "break the ice",
      "meaning": "розпочати розмову, зняти напругу",
      "example": "He told a joke to break the ice."
    }
  ]
}

Rules:
- meaning: brief explanation in Ukrainian
- example: a sentence from the transcript where the idiom appears, or a natural example using the same context
- Skip phrasal verbs that are not idiomatic (e.g. "pick up" alone is not an idiom unless used idiomatically)
- If no idioms found, return { "idioms": [] }
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
          { role: 'system', content: FIND_IDIOMS_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const idioms = parseIdiomsResponse(raw);

      return NextResponse.json({ success: true, idioms });
    }

    return NextResponse.json(
      { error: 'Idiom search currently requires OpenAI (AI_PROVIDER=openai)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding idioms:', error);
    return NextResponse.json(
      { error: 'Failed to find idioms' },
      { status: 500 }
    );
  }
}
