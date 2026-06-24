import type { RecordVideoHistoryInput } from '../../../../v2-core/types';
import { requireAuth } from '../../../../v2-core/http/request';
import * as videoHistoryService from '../../../../v2-core/services/video-history-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return videoHistoryService.listVideoHistory(auth);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = (await request.json()) as RecordVideoHistoryInput;
    return videoHistoryService.recordVideoHistory(auth, body);
  });
}
