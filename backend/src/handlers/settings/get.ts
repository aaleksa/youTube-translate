import * as userSettingsService from '../../../../v2-core/services/user-settings-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const settings = await userSettingsService.getUserSettings(auth);
  return ok(settings);
});
