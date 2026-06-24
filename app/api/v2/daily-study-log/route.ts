import type { UpsertDailyStudyLogInput } from '../../../../v2-core/types';
import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import * as dailyStudyLogService from '../../../../v2-core/services/daily-study-log-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return dailyStudyLogService.listDailyStudyLog(auth);
  });
}

export async function PUT(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<UpsertDailyStudyLogInput>(request);
    return dailyStudyLogService.upsertDailyStudyLog(auth, body);
  });
}
