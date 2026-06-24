import * as authService from '../../../v2-core/services/auth-service';
import {
  createProtectedHandler,
  ok,
} from '../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const authorization = event.headers.authorization ?? event.headers.Authorization;
  const accessToken = authorization?.replace(/^Bearer\s+/i, '') ?? '';
  const user = await authService.getCurrentUser(accessToken);
  return ok(user);
});
