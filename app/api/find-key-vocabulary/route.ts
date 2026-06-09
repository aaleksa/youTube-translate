import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseKeyVocabularyResponse } from '../../lib/keyVocabulary';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIND_KEY_VOCABULARY_PROMPT = `You are an English teacher helping Ukrainian learners extract the most useful vocabulary from a video transcript.

Identify 15–30 key English words and short phrases worth learning from this transcript.
Focus on words that are:
- important for understanding the video topic
- useful for everyday or professional English
- not trivial (skip the, and, is, it, very common A1 words unless topic-critical)

Return ONLY valid JSON:
{
  "vocabulary": [
    {
      "word": "negotiate",
      "meaning": "вести переговори",
      "example": "We need to negotiate a better deal."
    }
  ]
}

Rules:
- word: single word or short phrase (2–4 words max), not full sentences
- meaning: brief Ukrainian translation or explanation
- example: sentence from the transcript where the word appears, or natural example in same context
- Do not duplicate items with the same meaning
- Skip proper names unless culturally important
- If transcript is very short, return fewer items
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
          { role: 'system', content: FIND_KEY_VOCABULARY_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const vocabulary = parseKeyVocabularyResponse(raw);

      return NextResponse.json({ success: true, vocabulary });
    }

    return NextResponse.json(
      {
        error:
          'Key vocabulary search currently requires OpenAI (AI_PROVIDER=openai)',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error finding key vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to find key vocabulary' },
      { status: 500 }
    );
  }
}
