import type { GoogleLoginInput } from '../../../../../v2-core/types';
import * as authService from '../../../../../v2-core/services/auth-service';
import { handleRoute } from '../../_lib/route';

export async function POST(request: Request) {
  const body = (await request.json()) as GoogleLoginInput;
  return handleRoute(() => authService.loginWithGoogle(body));
}
