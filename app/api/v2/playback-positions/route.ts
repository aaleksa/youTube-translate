import { requireAuth } from '../../../../v2-core/http/request';
import * as playbackPositionService from '../../../../v2-core/services/playback-position-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return playbackPositionService.listPlaybackPositions(auth);
  });
}
