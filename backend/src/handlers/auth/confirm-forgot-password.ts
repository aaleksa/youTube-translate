import type { ConfirmForgotPasswordInput } from '../../../../v2-core/types';
import * as authService from '../../../../v2-core/services/auth-service';
import {
  createPublicHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createPublicHandler(async (event) => {
  const body = (await readBody(event)) as ConfirmForgotPasswordInput;
  const result = await authService.confirmForgotPassword(body);
  return ok(result);
});
