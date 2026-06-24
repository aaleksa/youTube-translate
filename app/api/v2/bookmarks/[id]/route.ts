import { requireAuth } from '../../../../../v2-core/http/request';
import * as bookmarkService from '../../../../../v2-core/services/bookmark-service';
import { handleRoute } from '../../_lib/route';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return handleRoute(async () => {
    const auth = await requireAuth(request);
    return bookmarkService.deleteBookmark(auth, decodeURIComponent(id));
  });
}
