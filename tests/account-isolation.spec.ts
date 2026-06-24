import { expect, test } from '@playwright/test';

const PASSWORD = 'password123';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

interface AuthUser {
  userId: string;
  email: string;
}

interface PaginatedFlashcards {
  items: unknown[];
  total: number;
}

async function signUpAndLogin(
  request: import('@playwright/test').APIRequestContext,
  email: string
): Promise<{ tokens: AuthTokens; userId: string; email: string }> {
  await request.post('/api/v2/auth/signup', {
    data: { email, password: PASSWORD },
  });

  const loginResponse = await request.post('/api/v2/auth/login', {
    data: { email, password: PASSWORD },
  });
  expect(loginResponse.ok()).toBeTruthy();

  const tokens = (await loginResponse.json()) as ApiEnvelope<AuthTokens>;

  const meResponse = await request.get('/api/v2/me', {
    headers: { Authorization: `Bearer ${tokens.data.accessToken}` },
  });
  expect(meResponse.ok()).toBeTruthy();
  const me = (await meResponse.json()) as ApiEnvelope<AuthUser>;

  return {
    tokens: tokens.data,
    userId: me.data.userId,
    email: me.data.email,
  };
}

test.describe('account isolation', () => {
  test('API keeps flashcards and video history scoped per user', async ({
    request,
  }) => {
    const stamp = Date.now();
    const emailA = `iso-a-${stamp}@test.local`;
    const emailB = `iso-b-${stamp}@test.local`;
    const markerTitle = `Isolation Marker ${stamp}`;
    const videoId = 'dQw4w9WgXcQ';

    const userA = await signUpAndLogin(request, emailA);
    const userB = await signUpAndLogin(request, emailB);

    const cardResponse = await request.post('/api/v2/flashcards', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
      data: {
        word: `marker-${stamp}`,
        translation: 'тест',
        videoId,
      },
    });
    expect(cardResponse.ok()).toBeTruthy();

    const historyResponse = await request.post('/api/v2/video-history', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
      data: {
        videoId,
        title: markerTitle,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channel: 'Test Channel',
      },
    });
    expect(historyResponse.ok()).toBeTruthy();

    const cardsForA = await request.get('/api/v2/flashcards?limit=100', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
    });
    expect(cardsForA.ok()).toBeTruthy();
    const cardsA = (await cardsForA.json()) as ApiEnvelope<PaginatedFlashcards>;
    expect(cardsA.data.total).toBeGreaterThan(0);

    const historyForA = await request.get('/api/v2/video-history', {
      headers: { Authorization: `Bearer ${userA.tokens.accessToken}` },
    });
    expect(historyForA.ok()).toBeTruthy();
    const historyA = (await historyForA.json()) as ApiEnvelope<unknown[]>;
    expect(historyA.data.length).toBeGreaterThan(0);

    const cardsForB = await request.get('/api/v2/flashcards?limit=100', {
      headers: { Authorization: `Bearer ${userB.tokens.accessToken}` },
    });
    expect(cardsForB.ok()).toBeTruthy();
    const cardsB = (await cardsForB.json()) as ApiEnvelope<PaginatedFlashcards>;
    expect(cardsB.data.total).toBe(0);

    const historyForB = await request.get('/api/v2/video-history', {
      headers: { Authorization: `Bearer ${userB.tokens.accessToken}` },
    });
    expect(historyForB.ok()).toBeTruthy();
    const historyB = (await historyForB.json()) as ApiEnvelope<unknown[]>;
    expect(historyB.data).toEqual([]);
  });
});
