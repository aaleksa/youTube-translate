import { isLocalBackend } from '../../../../v2-core/storage/config';
import { isGoogleAuthConfigured } from '../../../../v2-core/auth/google-config';
import { handleRoute } from '../_lib/route';

export async function GET() {
  return handleRoute(async () => ({
    storageBackend: isLocalBackend() ? 'local' : 'dynamodb',
    auth: isLocalBackend() ? 'local-jwt' : 'cognito',
    googleAuth: isGoogleAuthConfigured(),
  }));
}
