import type { QuizResultRecord } from '../../../v2-core/types';
import { apiGet } from './apiClient';

function buildVideoQuery(videoId?: string): string {
  if (!videoId) return '';
  return `?videoId=${encodeURIComponent(videoId)}`;
}

export async function listQuizResults(
  videoId?: string
): Promise<QuizResultRecord[]> {
  return apiGet<QuizResultRecord[]>(`/quiz-results${buildVideoQuery(videoId)}`);
}
