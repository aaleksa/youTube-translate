import * as bookmarkService from '../../../../v2-core/services/bookmark-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const bookmarkId = event.pathParameters?.id;
  if (!bookmarkId) {
    return ok({ success: false, error: 'Missing bookmark id' }, 400);
  }

  const result = await bookmarkService.deleteBookmark(auth, bookmarkId);
  return ok(result);
});
