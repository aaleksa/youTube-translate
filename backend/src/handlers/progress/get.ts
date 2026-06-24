import * as progressService from '../../../../v2-core/services/progress-service';
import {
  createProtectedHandler,
  ok,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (_event, auth) => {
  const progress = await progressService.getProgress(auth);
  return ok(progress);
});
