import type {
  CreateQuizResultInput,
  QuizResultRecord,
} from '../../../v2-core/types';
import { apiGet, apiPost } from './apiClient';

function buildVideoQuery(videoId?: string): string {
  if (!videoId) return '';
  return `?videoId=${encodeURIComponent(videoId)}`;
}

export async function listQuizResults(
  videoId?: string
): Promise<QuizResultRecord[]> {
  return apiGet<QuizResultRecord[]>(`/quiz-results${buildVideoQuery(videoId)}`);
}

export async function createQuizResult(
  input: CreateQuizResultInput
): Promise<QuizResultRecord> {
  return apiPost<QuizResultRecord>('/quiz-results', input);
}
