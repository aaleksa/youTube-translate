import { requireAuth } from '../../../../v2-core/http/request';
import * as userSettingsService from '../../../../v2-core/services/user-settings-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return userSettingsService.getUserSettings(auth);
  });
}
