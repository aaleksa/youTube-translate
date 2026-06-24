import type { UpsertVocabularyProgressInput } from '../../../../v2-core/types';
import { parseJsonBody, requireAuth } from '../../../../v2-core/http/request';
import * as vocabularyProgressService from '../../../../v2-core/services/vocabulary-progress-service';
import { handleRoute } from '../_lib/route';

export async function PUT(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseJsonBody<UpsertVocabularyProgressInput>(request);
    return vocabularyProgressService.upsertVocabularyProgress(auth, body);
  });
}
