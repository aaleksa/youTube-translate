import { requireAuth } from '../../../../../v2-core/http/request';
import * as videoHistoryService from '../../../../../v2-core/services/video-history-service';
import { handleRoute } from '../../_lib/route';

interface RouteContext {
  params: Promise<{ videoId: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { videoId } = await context.params;
    return videoHistoryService.deleteVideoHistory(auth, decodeURIComponent(videoId));
  });
}
