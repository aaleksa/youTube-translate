import type { CreateBookmarkInput } from '../../../../v2-core/types';
import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import * as bookmarkService from '../../../../v2-core/services/bookmark-service';
import { handleRoute } from '../_lib/route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId') ?? undefined;
    return bookmarkService.listBookmarks(auth, videoId);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<CreateBookmarkInput>(request);
    return bookmarkService.createBookmark(auth, body);
  }, 201);
}
