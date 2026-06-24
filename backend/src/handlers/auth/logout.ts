import * as authService from '../../../../v2-core/services/auth-service';
import {
  createPublicHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createPublicHandler(async (event) => {
  const body = (await readBody(event)) as {
    accessToken?: string;
    refreshToken?: string;
  };
  const result = await authService.logout(body);
  return ok(result);
});
