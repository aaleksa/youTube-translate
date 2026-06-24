import type { ConfirmSignUpInput } from '../../../../../v2-core/types';
import * as authService from '../../../../../v2-core/services/auth-service';
import { handleRoute } from '../../_lib/route';

export async function POST(request: Request) {
  const body = (await request.json()) as ConfirmSignUpInput;
  return handleRoute(() => authService.confirmSignUp(body));
}
