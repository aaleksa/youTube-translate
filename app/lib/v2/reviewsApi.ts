import type { TodayReviewsResponse } from '../../../v2-core/types';
import { apiGet } from './apiClient';

export async function getTodayReviews(): Promise<TodayReviewsResponse> {
  return apiGet<TodayReviewsResponse>('/reviews/today');
}
