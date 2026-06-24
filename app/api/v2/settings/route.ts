import type { UpdateUserSettingsInput } from '../../../../v2-core/types';
import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import * as userSettingsService from '../../../../v2-core/services/user-settings-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return userSettingsService.getUserSettings(auth);
  });
}

export async function PUT(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<UpdateUserSettingsInput>(request);
    return userSettingsService.updateUserSettings(auth, body);
  });
}
