import type { ConfirmSignUpInput } from '../../../../v2-core/types';
import * as authService from '../../../../v2-core/services/auth-service';
import {
  createPublicHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createPublicHandler(async (event) => {
  const body = (await readBody(event)) as ConfirmSignUpInput;
  const result = await authService.confirmSignUp(body);
  return ok(result);
});
