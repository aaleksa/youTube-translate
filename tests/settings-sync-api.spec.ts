import { expect, test } from '@playwright/test';
import {
  signUpAndLogin,
  type ApiEnvelope,
} from './helpers/auth';
import type {
  DailyStudyLogRecord,
  PronunciationAttemptRecord,
  QuizResultRecord,
  UserSettingsRecord,
} from '../v2-core/types';

test.describe('V2 sync API', () => {
  test('settings round-trip includes learning goals', async ({ request }) => {
    const email = `settings-sync-${Date.now()}@example.com`;
    const { tokens } = await signUpAndLogin(request, email);

    const headers = { Authorization: `Bearer ${tokens.accessToken}` };

    const getResponse = await request.get('/api/v2/settings', { headers });
    expect(getResponse.ok()).toBeTruthy();
    const initial = (await getResponse.json()) as ApiEnvelope<UserSettingsRecord>;
    expect(initial.data.dailyCardGoal).toBe(30);
    expect(initial.data.learningLevel).toBe('intermediate');

    const putResponse = await request.put('/api/v2/settings', {
      headers,
      data: {
        dailyCardGoal: 42,
        vocabularyGoal: 500,
        learningLevel: 'advanced',
        autoPause: { quiz: true },
      },
    });
    expect(putResponse.ok()).toBeTruthy();
    const updated = (await putResponse.json()) as ApiEnvelope<UserSettingsRecord>;
    expect(updated.data.dailyCardGoal).toBe(42);
    expect(updated.data.vocabularyGoal).toBe(500);
    expect(updated.data.learningLevel).toBe('advanced');
    expect(updated.data.autoPause.quiz).toBe(true);
  });

  test('quiz-results create and list are user-scoped', async ({ request }) => {
    const emailA = `quiz-a-${Date.now()}@example.com`;
    const emailB = `quiz-b-${Date.now()}@example.com`;
    const userA = await signUpAndLogin(request, emailA);
    const userB = await signUpAndLogin(request, emailB);

    const createResponse = await request.post('/api/v2/quiz-results', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
      data: {
        videoId: 'flashcards',
        score: 8,
        totalQuestions: 10,
      },
    });
    expect(createResponse.status()).toBe(201);
    const created = (await createResponse.json()) as ApiEnvelope<QuizResultRecord>;
    expect(created.data.videoId).toBe('flashcards');
    expect(created.data.score).toBe(8);

    const listA = await request.get('/api/v2/quiz-results', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
    });
    expect(listA.ok()).toBeTruthy();
    const resultsA = (await listA.json()) as ApiEnvelope<QuizResultRecord[]>;
    expect(resultsA.data.some((item) => item.id === created.data.id)).toBeTruthy();

    const listB = await request.get('/api/v2/quiz-results', {
      headers: { Authorization: `Bearer ${userB.tokens.accessToken}` },
    });
    expect(listB.ok()).toBeTruthy();
    const resultsB = (await listB.json()) as ApiEnvelope<QuizResultRecord[]>;
    expect(resultsB.data.some((item) => item.id === created.data.id)).toBeFalsy();
  });

  test('daily-study-log upsert merges counts by date', async ({ request }) => {
    const email = `daily-study-${Date.now()}@example.com`;
    const { tokens } = await signUpAndLogin(request, email);
    const headers = { Authorization: `Bearer ${tokens.accessToken}` };

    const first = await request.put('/api/v2/daily-study-log', {
      headers,
      data: {
        date: '2026-06-08',
        cardsReviewed: 5,
        correctReviews: 4,
        incorrectReviews: 1,
      },
    });
    expect(first.ok()).toBeTruthy();

    const second = await request.put('/api/v2/daily-study-log', {
      headers,
      data: {
        date: '2026-06-08',
        cardsReviewed: 8,
        correctReviews: 6,
        incorrectReviews: 2,
      },
    });
    expect(second.ok()).toBeTruthy();
    const merged = (await second.json()) as ApiEnvelope<DailyStudyLogRecord>;
    expect(merged.data.cardsReviewed).toBe(8);
    expect(merged.data.correctReviews).toBe(6);

    const list = await request.get('/api/v2/daily-study-log', { headers });
    expect(list.ok()).toBeTruthy();
    const entries = (await list.json()) as ApiEnvelope<DailyStudyLogRecord[]>;
    expect(entries.data.some((item) => item.date === '2026-06-08')).toBeTruthy();
  });

  test('pronunciation-attempts create and list are user-scoped', async ({
    request,
  }) => {
    const emailA = `pron-a-${Date.now()}@example.com`;
    const emailB = `pron-b-${Date.now()}@example.com`;
    const userA = await signUpAndLogin(request, emailA);
    const userB = await signUpAndLogin(request, emailB);

    const attemptId = `attempt_test_${Date.now()}`;

    const createResponse = await request.post('/api/v2/pronunciation-attempts', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
      data: {
        id: attemptId,
        videoId: 'dQw4w9WgXcQ',
        expectedText: 'Hello world',
        recognizedText: 'Hello word',
        score: 82,
        missedWords: ['world'],
        extraWords: [],
        durationMs: 1200,
      },
    });
    expect(createResponse.status()).toBe(201);
    const created = (await createResponse.json()) as ApiEnvelope<PronunciationAttemptRecord>;
    expect(created.data.score).toBe(82);

    const listA = await request.get('/api/v2/pronunciation-attempts', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
    });
    const resultsA = (await listA.json()) as ApiEnvelope<PronunciationAttemptRecord[]>;
    expect(resultsA.data.some((item) => item.id === attemptId)).toBeTruthy();

    const listB = await request.get('/api/v2/pronunciation-attempts', {
      headers: { Authorization: `Bearer ${userB.tokens.accessToken}` },
    });
    const resultsB = (await listB.json()) as ApiEnvelope<PronunciationAttemptRecord[]>;
    expect(resultsB.data.some((item) => item.id === attemptId)).toBeFalsy();
  });

  test('coach-advice requires premium', async ({ request }) => {
    const email = `coach-free-${Date.now()}@example.com`;
    const { tokens } = await signUpAndLogin(request, email);

    const response = await request.post('/api/coach-advice', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      data: {
        learningLevel: 'intermediate',
        streak: 3,
        quizAccuracyPercent: 70,
        srsSuccessRatePercent: 80,
        weakWords: ['negotiate'],
        dueToday: 5,
        cardsReviewedToday: 2,
        dailyCardGoal: 30,
        vocabularySaved: 40,
        vocabularyGoal: 1000,
      },
    });

    expect(response.status()).toBe(403);
    const body = (await response.json()) as { code?: string };
    expect(body.code).toBe('PREMIUM_REQUIRED');
  });
});
