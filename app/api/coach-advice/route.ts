import { NextRequest, NextResponse } from 'next/server';
import {
  AI_PROVIDER,
  callLmStudio,
  callOpenAi,
} from '../../lib/aiChat';
import { buildCoachAdvicePrompt } from '../../lib/aiPrompts';
import { resolveTaskLanguage } from '../../lib/aiInterfaceLanguage';
import type {
  CoachAdviceRequest,
  CoachAdviceResponse,
} from '../../lib/coachAdviceTypes';
import {
  aiAccessErrorResponse,
  enforcePremiumCoachAccess,
} from '../_lib/ai-access';

function sanitizePayload(input: CoachAdviceRequest): CoachAdviceRequest {
  return {
    learningLevel: String(input.learningLevel ?? 'intermediate').slice(0, 32),
    streak: Math.max(0, Math.min(999, Number(input.streak) || 0)),
    quizAccuracyPercent:
      input.quizAccuracyPercent === null ||
      input.quizAccuracyPercent === undefined
        ? null
        : Math.max(0, Math.min(100, Math.round(Number(input.quizAccuracyPercent)))),
    srsSuccessRatePercent:
      input.srsSuccessRatePercent === null ||
      input.srsSuccessRatePercent === undefined
        ? null
        : Math.max(0, Math.min(100, Math.round(Number(input.srsSuccessRatePercent)))),
    weakWords: Array.isArray(input.weakWords)
      ? input.weakWords
          .map((word) => String(word).trim())
          .filter(Boolean)
          .slice(0, 12)
      : [],
    dueToday: Math.max(0, Math.min(999, Number(input.dueToday) || 0)),
    cardsReviewedToday: Math.max(
      0,
      Math.min(999, Number(input.cardsReviewedToday) || 0)
    ),
    dailyCardGoal: Math.max(1, Math.min(999, Number(input.dailyCardGoal) || 30)),
    vocabularySaved: Math.max(0, Math.min(99999, Number(input.vocabularySaved) || 0)),
    vocabularyGoal: Math.max(1, Math.min(99999, Number(input.vocabularyGoal) || 1000)),
    taskLanguage: input.taskLanguage,
    interfaceLanguage: input.interfaceLanguage,
  };
}

function buildUserPrompt(payload: CoachAdviceRequest): string {
  return JSON.stringify(
    {
      learningLevel: payload.learningLevel,
      streakDays: payload.streak,
      quizAccuracyPercent: payload.quizAccuracyPercent,
      srsSuccessRatePercent: payload.srsSuccessRatePercent,
      weakWords: payload.weakWords,
      cardsDueToday: payload.dueToday,
      cardsReviewedToday: payload.cardsReviewedToday,
      dailyCardGoal: payload.dailyCardGoal,
      vocabularySaved: payload.vocabularySaved,
      vocabularyGoal: payload.vocabularyGoal,
    },
    null,
    2
  );
}

function parseCoachAdviceResponse(raw: string): CoachAdviceResponse | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CoachAdviceResponse>;
    const summary = String(parsed.summary ?? '').trim();
    const focusTips = Array.isArray(parsed.focusTips)
      ? parsed.focusTips
          .map((tip) => String(tip).trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];

    if (!summary || focusTips.length === 0) {
      return null;
    }

    return { summary, focusTips };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await enforcePremiumCoachAccess(request);
  } catch (error) {
    const accessError = aiAccessErrorResponse(error);
    if (accessError) return accessError;
    throw error;
  }

  try {
    const body = (await request.json()) as CoachAdviceRequest;
    const payload = sanitizePayload(body);
    const language = resolveTaskLanguage(
      payload.taskLanguage ?? payload.interfaceLanguage
    );
    const systemPrompt = buildCoachAdvicePrompt(language);
    const input = buildUserPrompt(payload);

    if (AI_PROVIDER === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY is not configured' },
          { status: 500 }
        );
      }

      const { result } = await callOpenAi(systemPrompt, input, {
        json: true,
        temperature: 0.6,
      });
      const advice = parseCoachAdviceResponse(result);
      if (!advice) {
        return NextResponse.json(
          { error: 'Failed to parse coach advice' },
          { status: 502 }
        );
      }

      return NextResponse.json(advice);
    }

    const { result } = await callLmStudio(systemPrompt, input, {
      json: true,
      temperature: 0.6,
    });
    const advice = parseCoachAdviceResponse(result);
    if (!advice) {
      return NextResponse.json(
        { error: 'Failed to parse coach advice' },
        { status: 502 }
      );
    }

    return NextResponse.json(advice);
  } catch (error) {
    console.error('[coach-advice]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Coach advice failed' },
      { status: 500 }
    );
  }
}
