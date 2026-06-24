import type { LoginInput } from '../../../../v2-core/types';
import * as authService from '../../../../v2-core/services/auth-service';
import {
  createPublicHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createPublicHandler(async (event) => {
  const body = (await readBody(event)) as LoginInput;
  const tokens = await authService.login(body);
  return ok(tokens);
});
