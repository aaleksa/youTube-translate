import type { SavePlaybackPositionInput } from '../../../../v2-core/types';
import { requireAuth } from '../../../../v2-core/http/request';
import * as playbackPositionService from '../../../../v2-core/services/playback-position-service';
import { handleRoute } from '../_lib/route';

export async function PUT(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = (await request.json()) as SavePlaybackPositionInput;
    return playbackPositionService.savePlaybackPosition(auth, body);
  });
}
