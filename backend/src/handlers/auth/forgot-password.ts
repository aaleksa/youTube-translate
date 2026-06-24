import type { ForgotPasswordInput } from '../../../../v2-core/types';
import * as authService from '../../../../v2-core/services/auth-service';
import {
  createPublicHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createPublicHandler(async (event) => {
  const body = (await readBody(event)) as ForgotPasswordInput;
  const result = await authService.forgotPassword(body);
  return ok(result);
});
