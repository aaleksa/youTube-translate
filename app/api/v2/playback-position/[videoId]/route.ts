import { requireAuth } from '../../../../../v2-core/http/request';
import * as playbackPositionService from '../../../../../v2-core/services/playback-position-service';
import { handleRoute } from '../../_lib/route';

interface RouteContext {
  params: Promise<{ videoId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { videoId } = await context.params;
    return playbackPositionService.getPlaybackPosition(
      auth,
      decodeURIComponent(videoId)
    );
  });
}
