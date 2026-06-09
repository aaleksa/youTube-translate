import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { parseQuizResponse } from '../../lib/videoQuiz';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 4096;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GENERATE_QUIZ_PROMPT = `You are an English teacher creating a comprehension quiz for Ukrainian learners based on a YouTube video transcript.

Generate 5–10 multiple-choice questions testing understanding of the video content (main ideas, details, vocabulary in context, speaker's point).

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the video mainly about?",
      "options": [
        "Travel tips",
        "Learning English",
        "Cooking recipes",
        "Sports news"
      ],
      "correctIndex": 1,
      "explanation": "The speaker focuses on practical ways to improve English skills."
    }
  ]
}

Rules:
- question: in English, clear and natural
- options: exactly 4 plausible answers in English per question
- correctIndex: 0-based index of the correct option
- explanation: brief explanation in English shown after checking
- Questions must be answerable from the transcript only — no outside knowledge
- Mix difficulty: some easy (main topic), some detail-based
- No duplicate or near-duplicate questions
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
          { role: 'system', content: GENERATE_QUIZ_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0.5,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
      });

      const raw = message.choices[0]?.message?.content?.trim() ?? '';
      const quiz = parseQuizResponse(raw);

      if (!quiz) {
        return NextResponse.json(
          { error: 'Failed to parse quiz questions' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, questions: quiz.questions });
    }

    return NextResponse.json(
      { error: 'Quiz generation currently requires OpenAI (AI_PROVIDER=openai)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
