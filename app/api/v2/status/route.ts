import { isLocalBackend } from '../../../../v2-core/storage/config';
import { handleRoute } from '../_lib/route';

export async function GET() {
  return handleRoute(async () => ({
    storageBackend: isLocalBackend() ? 'local' : 'dynamodb',
    auth: isLocalBackend() ? 'local-jwt' : 'cognito',
  }));
}
