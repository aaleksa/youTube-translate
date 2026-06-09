import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
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

const EXPLAIN_SENTENCE_PROMPT = `You are an English teacher helping Ukrainian learners understand one sentence from a video transcript.

Explain the sentence in simple Ukrainian and highlight difficult English words or phrases.

Return ONLY valid JSON:
{
  "meaning": "1-3 простих речення українською: що означає це речення в контексті.",
  "difficultWords": [
    {
      "word": "English word or phrase",
      "explanation": "коротке пояснення українською"
    }
  ]
}

Rules:
- meaning must be simple and clear for A2-B1 learners
- difficultWords: 0-5 items that may confuse learners (idioms, rare words, phrasal verbs)
- explanation for each word: one short sentence in Ukrainian
- If the sentence is very simple, return an empty difficultWords array
- Do not invent context beyond the sentence
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
    const { sentence } = await request.json();

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
          { role: 'system', content: EXPLAIN_SENTENCE_PROMPT },
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
