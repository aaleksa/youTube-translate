import type { UpsertVocabularyProgressInput } from '../../../../v2-core/types';
import * as vocabularyProgressService from '../../../../v2-core/services/vocabulary-progress-service';
import {
  createProtectedHandler,
  ok,
  readBody,
} from '../../../../v2-core/lambda/handler';

export const handler = createProtectedHandler(async (event, auth) => {
  const body = (await readBody(event)) as UpsertVocabularyProgressInput;
  const record = await vocabularyProgressService.upsertVocabularyProgress(auth, body);
  return ok(record);
});
