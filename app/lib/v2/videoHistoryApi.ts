import type { RecordVideoHistoryInput, VideoHistoryRecord } from '../../../v2-core/types';
import { apiDelete, apiGet, apiPost } from './apiClient';

export async function listVideoHistory(): Promise<VideoHistoryRecord[]> {
  return apiGet<VideoHistoryRecord[]>('/video-history');
}

export async function recordVideoHistory(
  input: RecordVideoHistoryInput
): Promise<VideoHistoryRecord> {
  return apiPost<VideoHistoryRecord>('/video-history', input);
}

export async function deleteVideoHistory(videoId: string): Promise<void> {
  await apiDelete(`/video-history/${encodeURIComponent(videoId)}`);
}
