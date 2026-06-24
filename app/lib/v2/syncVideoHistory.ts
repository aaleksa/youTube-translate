import { isBackendV2Enabled } from './config';
import { getAccessToken } from './tokenStorage';
import { recordVideoHistory } from './videoHistoryApi';

export interface SyncVideoHistoryInput {
  videoId: string;
  title: string;
  url: string;
  channel: string;
}

export async function syncVideoHistoryToServer(
  input: SyncVideoHistoryInput
): Promise<void> {
  if (!isBackendV2Enabled() || !getAccessToken()) {
    return;
  }

  try {
    await recordVideoHistory({
      videoId: input.videoId,
      title: input.title,
      url: input.url,
      channel: input.channel,
    });
  } catch (error) {
    console.warn('[video-history] Failed to sync to server:', error);
  }
}
