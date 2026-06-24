import type {
  CoachAdviceRequest,
  CoachAdviceResponse,
} from '../coachAdviceTypes';
import { fetchAuthenticatedApi } from '../aiApiClient';

export class CoachAdviceError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'CoachAdviceError';
    this.status = status;
    this.code = code;
  }
}

export async function fetchCoachAdvice(
  payload: CoachAdviceRequest
): Promise<CoachAdviceResponse> {
  const response = await fetchAuthenticatedApi('/api/coach-advice', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as CoachAdviceResponse & {
    error?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new CoachAdviceError(
      body.error ?? 'Failed to load coach advice',
      response.status,
      body.code
    );
  }

  return body;
}
