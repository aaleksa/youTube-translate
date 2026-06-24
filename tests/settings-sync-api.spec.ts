import { expect, test } from '@playwright/test';
import {
  signUpAndLogin,
  type ApiEnvelope,
} from './helpers/auth';
import type {
  QuizResultRecord,
  UserSettingsRecord,
} from '../v2-core/types';

test.describe('settings and quiz-results sync API', () => {
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
});
