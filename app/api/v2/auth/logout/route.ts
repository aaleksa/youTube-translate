import * as authService from '../../../../../v2-core/services/auth-service';
import { handleRoute } from '../../_lib/route';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    accessToken?: string;
    refreshToken?: string;
  };

  return handleRoute(() =>
    authService.logout({
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    })
  );
}
