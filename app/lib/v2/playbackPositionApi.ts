import type {
  PlaybackPositionRecord,
  SavePlaybackPositionInput,
} from '../../../v2-core/types';
import { apiGet, apiPut } from './apiClient';

export async function getPlaybackPosition(
  videoId: string
): Promise<PlaybackPositionRecord> {
  return apiGet<PlaybackPositionRecord>(
    `/playback-position/${encodeURIComponent(videoId)}`
  );
}

export async function savePlaybackPosition(
  input: SavePlaybackPositionInput
): Promise<PlaybackPositionRecord> {
  return apiPut<PlaybackPositionRecord>('/playback-position', input);
}
