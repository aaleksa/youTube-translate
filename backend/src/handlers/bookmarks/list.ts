import * as bookmarkService from '../../../../v2-core/services/bookmark-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const videoId = event.queryStringParameters?.videoId;
  const bookmarks = await bookmarkService.listBookmarks(auth, videoId);
  return ok(bookmarks);
});
