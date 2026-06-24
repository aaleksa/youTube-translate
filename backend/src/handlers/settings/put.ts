import type { UpdateUserSettingsInput } from '../../../../v2-core/types';
import * as userSettingsService from '../../../../v2-core/services/user-settings-service';
import {
  createProtectedHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const body = (await readBody(event)) as UpdateUserSettingsInput;
  const settings = await userSettingsService.updateUserSettings(auth, body);
  return ok(settings);
});
