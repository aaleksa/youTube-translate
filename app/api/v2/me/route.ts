import * as authService from '../../../../v2-core/services/auth-service';
import { requireAuth } from '../../../../v2-core/http/request';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return authService.getCurrentUser(
      request.headers.get('authorization')!.split(' ')[1]
    );
  });
}
