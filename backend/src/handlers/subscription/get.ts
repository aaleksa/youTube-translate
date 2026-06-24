import * as premiumAccessService from '../../../../v2-core/services/premium-access-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const access = await premiumAccessService.getPremiumAccess(auth);
  return ok(access);
});
