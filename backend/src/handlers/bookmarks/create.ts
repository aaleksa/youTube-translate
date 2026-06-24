import type { CreateBookmarkInput } from '../../../../v2-core/types';
import * as bookmarkService from '../../../../v2-core/services/bookmark-service';
import {
  createProtectedHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const body = (await readBody(event)) as CreateBookmarkInput;
  const bookmark = await bookmarkService.createBookmark(auth, body);
  return ok(bookmark, 201);
});
