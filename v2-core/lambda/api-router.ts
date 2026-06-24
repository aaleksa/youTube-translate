import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { getAuthFromApiGatewayEvent } from '../auth/context';
import { isGoogleAuthConfigured } from '../auth/google-config';
import { ApiError, UnauthorizedError } from '../errors';
import { logger } from '../logging/logger';
import { handleServiceError, jsonResponse, successResponse } from '../response';
import { isLocalBackend } from '../storage/config';
import * as authService from '../services/auth-service';
import * as bookmarkService from '../services/bookmark-service';
import * as deckService from '../services/deck-service';
import * as flashcardService from '../services/flashcard-service';
import * as premiumAccessService from '../services/premium-access-service';
import * as progressService from '../services/progress-service';
import * as quizResultService from '../services/quiz-result-service';
import * as reviewService from '../services/review-service';
import * as userSettingsService from '../services/user-settings-service';
import * as vocabularyProgressService from '../services/vocabulary-progress-service';
import * as playbackPositionService from '../services/playback-position-service';
import * as videoHistoryService from '../services/video-history-service';
import type {
  ConfirmForgotPasswordInput,
  ConfirmSignUpInput,
  CreateBookmarkInput,
  CreateFlashcardInput,
  FlashcardRecord,
  ForgotPasswordInput,
  GoogleLoginInput,
  LoginInput,
  RecordVideoHistoryInput,
  RefreshTokenInput,
  SavePlaybackPositionInput,
  SignUpInput,
  UpdateUserSettingsInput,
  UpsertVocabularyProgressInput,
} from '../types';
import { parsePaginationParams } from '../validation/pagination';
import {
  getEventPath,
  getQueryParams,
  getRequestId,
  parseEventBody,
} from './event';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

async function toApiGatewayResponse(
  response: Response
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
    body: await response.text(),
  };
}

async function ok<T>(data?: T, statusCode = 200): Promise<APIGatewayProxyResultV2> {
  return toApiGatewayResponse(jsonResponse(successResponse(data), statusCode, corsHeaders()));
}

type PublicHandler = (
  event: APIGatewayProxyEventV2,
  path: string
) => Promise<APIGatewayProxyResultV2>;

const PUBLIC_ROUTES: Record<string, PublicHandler> = {
  'GET /status': async () =>
    ok({
      storageBackend: isLocalBackend() ? 'local' : 'dynamodb',
      auth: isLocalBackend() ? 'local-jwt' : 'cognito',
      googleAuth: isGoogleAuthConfigured(),
    }),
  'POST /auth/signup': async (event) => {
    const body = parseEventBody(event) as SignUpInput;
    return ok(await authService.signUp(body), 201);
  },
  'POST /auth/login': async (event) => {
    const body = parseEventBody(event) as LoginInput;
    return ok(await authService.login(body));
  },
  'POST /auth/refresh': async (event) => {
    const body = parseEventBody(event) as RefreshTokenInput;
    return ok(await authService.refreshTokens(body));
  },
  'POST /auth/logout': async (event) => {
    const body = parseEventBody(event) as {
      accessToken?: string;
      refreshToken?: string;
    };
    return ok(await authService.logout(body));
  },
  'POST /auth/confirm': async (event) => {
    const body = parseEventBody(event) as ConfirmSignUpInput;
    return ok(await authService.confirmSignUp(body));
  },
  'POST /auth/forgot-password': async (event) => {
    const body = parseEventBody(event) as ForgotPasswordInput;
    return ok(await authService.forgotPassword(body));
  },
  'POST /auth/confirm-forgot-password': async (event) => {
    const body = parseEventBody(event) as ConfirmForgotPasswordInput;
    return ok(await authService.confirmForgotPassword(body));
  },
  'POST /auth/google': async (event) => {
    const body = parseEventBody(event) as GoogleLoginInput;
    return ok(await authService.loginWithGoogle(body));
  },
};

async function dispatchProtected(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  path: string
): Promise<APIGatewayProxyResultV2> {
  const auth = getAuthFromApiGatewayEvent(event);
  const method = event.requestContext.http.method;
  const body = parseEventBody(event);
  const query = getQueryParams(event);

  if (method === 'GET' && path === '/me') {
    const authorization =
      event.headers?.authorization ?? event.headers?.Authorization;
    const token = authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError();
    }
    return ok(await authService.getCurrentUser(token));
  }

  if (method === 'GET' && path === '/flashcards') {
    const pagination = parsePaginationParams(query);
    return ok(await flashcardService.listFlashcards(auth, pagination));
  }

  if (method === 'POST' && path === '/flashcards') {
    return ok(
      await flashcardService.createFlashcard(auth, body as CreateFlashcardInput),
      201
    );
  }

  const flashcardMatch = path.match(/^\/flashcards\/([^/]+)$/);
  if (flashcardMatch) {
    const cardId = decodeURIComponent(flashcardMatch[1]);
    if (method === 'PUT') {
      return ok(
        await flashcardService.updateFlashcard(
          auth,
          cardId,
          body as Partial<Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>>
        )
      );
    }
    if (method === 'DELETE') {
      return ok(await flashcardService.deleteFlashcard(auth, cardId));
    }
  }

  if (method === 'GET' && path === '/decks') {
    return ok(await deckService.listDecks(auth));
  }

  if (method === 'GET' && path === '/progress') {
    return ok(await progressService.getProgress(auth));
  }

  if (method === 'GET' && path === '/bookmarks') {
    return ok(await bookmarkService.listBookmarks(auth, query.get('videoId') ?? undefined));
  }

  if (method === 'POST' && path === '/bookmarks') {
    return ok(
      await bookmarkService.createBookmark(auth, body as CreateBookmarkInput),
      201
    );
  }

  const bookmarkMatch = path.match(/^\/bookmarks\/([^/]+)$/);
  if (bookmarkMatch && method === 'DELETE') {
    return ok(
      await bookmarkService.deleteBookmark(
        auth,
        decodeURIComponent(bookmarkMatch[1])
      )
    );
  }

  if (method === 'GET' && path === '/quiz-results') {
    return ok(
      await quizResultService.listQuizResults(auth, query.get('videoId') ?? undefined)
    );
  }

  if (method === 'PUT' && path === '/vocabulary-progress') {
    return ok(
      await vocabularyProgressService.upsertVocabularyProgress(
        auth,
        body as UpsertVocabularyProgressInput
      )
    );
  }

  if (method === 'GET' && path === '/settings') {
    return ok(await userSettingsService.getUserSettings(auth));
  }

  if (method === 'PUT' && path === '/settings') {
    return ok(
      await userSettingsService.updateUserSettings(
        auth,
        body as UpdateUserSettingsInput
      )
    );
  }

  if (method === 'GET' && path === '/subscription') {
    return ok(await premiumAccessService.getPremiumAccess(auth));
  }

  if (method === 'GET' && path === '/reviews/today') {
    return ok(await reviewService.listTodayReviews(auth));
  }

  if (method === 'GET' && path === '/video-history') {
    return ok(await videoHistoryService.listVideoHistory(auth));
  }

  if (method === 'POST' && path === '/video-history') {
    return ok(
      await videoHistoryService.recordVideoHistory(
        auth,
        body as RecordVideoHistoryInput
      ),
      201
    );
  }

  const videoHistoryMatch = path.match(/^\/video-history\/([^/]+)$/);
  if (videoHistoryMatch && method === 'DELETE') {
    return ok(
      await videoHistoryService.deleteVideoHistory(
        auth,
        decodeURIComponent(videoHistoryMatch[1])
      )
    );
  }

  if (method === 'PUT' && path === '/playback-position') {
    return ok(
      await playbackPositionService.savePlaybackPosition(
        auth,
        body as SavePlaybackPositionInput
      )
    );
  }

  const playbackMatch = path.match(/^\/playback-position\/([^/]+)$/);
  if (playbackMatch && method === 'GET') {
    return ok(
      await playbackPositionService.getPlaybackPosition(
        auth,
        decodeURIComponent(playbackMatch[1])
      )
    );
  }

  throw new ApiError('Route not found', 404, 'NOT_FOUND');
}

export async function dispatchApiRoute(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = getEventPath(event);
  const requestId = getRequestId(event);

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
    };
  }

  logger.info('API request', { requestId, method, path });

  try {
    const publicKey = `${method} ${path}`;
    const publicHandler = PUBLIC_ROUTES[publicKey];
    if (publicHandler) {
      return await publicHandler(event, path);
    }

    return await dispatchProtected(
      event as APIGatewayProxyEventV2WithJWTAuthorizer,
      path
    );
  } catch (error) {
    logger.error('API request failed', {
      requestId,
      method,
      path,
      code: error instanceof ApiError ? error.code : 'INTERNAL',
    });
    return toApiGatewayResponse(handleServiceError(error));
  }
}
