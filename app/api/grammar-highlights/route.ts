import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseGrammarHighlightsResponse } from '../../lib/grammarHighlights';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GRAMMAR_PROMPT = `You are an English grammar teacher analyzing a video transcript for Ukrainian learners.

Identify the main grammar patterns, tenses, and constructions used in the transcript.
Focus on what appears multiple times or is pedagogically notable.

Examples: Present Perfect, Past Simple, Passive voice, Conditionals (2nd), Relative clauses, Modal verbs (should/must), Gerunds, Reported speech.

Return ONLY valid JSON:
{
  "highlights": [
    {
      "pattern": "Present Perfect",
      "count": 3,
      "note": "Використовується для досвіду та результатів у теперішньому."
    }
  ]
}

Rules:
- pattern: short English grammar label
- count: approximate number of times the pattern appears in the transcript (minimum 1)
- note: one short sentence in Ukrainian explaining usage in this video
- List 3–8 most relevant patterns, ordered by importance or frequency
- If very little grammar variety, return fewer items
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
          { role: 'system', content: GRAMMAR_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const parsed = parseGrammarHighlightsResponse(raw);

      if (!parsed) {
        return NextResponse.json(
          { error: 'Failed to parse grammar highlights' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, ...parsed });
    }

    return NextResponse.json(
      {
        error:
          'Grammar analysis currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error analyzing grammar:', error);
    return NextResponse.json(
      { error: 'Failed to analyze grammar' },
      { status: 500 }
    );
  }
}
