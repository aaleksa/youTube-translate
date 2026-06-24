import { NextRequest, NextResponse } from 'next/server';
import { aiAccessErrorResponse, enforceAiAccess } from '../_lib/ai-access';
import {
  AI_PROVIDER,
  AI_API_URL,
  callLmStudio,
  callOpenAi,
} from '../../lib/aiChat';
import { resolveTaskLanguage } from '../../lib/aiInterfaceLanguage';
import { buildGenerateQuizPrompt } from '../../lib/aiPrompts';
import { parseQuizResponse } from '../../lib/videoQuiz';

const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;

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

async function generateQuizFromAi(
  systemPrompt: string,
  input: string
): Promise<{ questions: ReturnType<typeof parseQuizResponse>; error?: string }> {
  if (AI_PROVIDER === 'openai') {
    try {
      const { result } = await callOpenAi(systemPrompt, input, {
        json: true,
        temperature: 0.5,
      });
      const quiz = parseQuizResponse(result);
      if (!quiz) {
        return { questions: null, error: 'Failed to parse quiz questions' };
      }
      return { questions: quiz };
    } catch (error) {
      return {
        questions: null,
        error: error instanceof Error ? error.message : 'OpenAI API error',
      };
    }
  }

  const { result, errorText } = await callLmStudio(systemPrompt, input, {
    temperature: 0.5,
  });

  if (!result) {
    return {
      questions: null,
      error: errorText || 'LM Studio returned an empty response',
    };
  }

  const quiz = parseQuizResponse(result);
  if (!quiz) {
    return { questions: null, error: 'Failed to parse quiz questions' };
  }

  return { questions: quiz };
}

export async function POST(request: NextRequest) {
  try {
    await enforceAiAccess(request);
  } catch (error) {
    const accessError = aiAccessErrorResponse(error);
    if (accessError) return accessError;
    throw error;
  }

  try {
    const { text, taskLanguage } = await request.json();
    const lang = resolveTaskLanguage(taskLanguage);
    const systemPrompt = buildGenerateQuizPrompt(lang);

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = sanitizeText(String(text));
    if (!cleanText) {
      return NextResponse.json({ error: 'Text is empty' }, { status: 400 });
    }

    const input = `Transcript:\n${truncateText(cleanText, getMaxInputChars())}`;
    const { questions: quiz, error } = await generateQuizFromAi(systemPrompt, input);

    if (!quiz) {
      const status =
        error?.includes('ECONNREFUSED') || error?.includes('fetch failed')
          ? 503
          : 500;
      return NextResponse.json(
        {
          error:
            status === 503
              ? `Cannot connect to AI API at ${AI_API_URL}`
              : error || 'Failed to generate quiz',
        },
        { status }
      );
    }

    return NextResponse.json({ success: true, questions: quiz.questions });
  } catch (error) {
    console.error('Error generating quiz:', error);

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: `Cannot connect to AI API at ${AI_API_URL}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
