import { handleServiceError, jsonResponse, successResponse } from '../../../../v2-core/response';

export async function handleRoute<T>(
  handler: () => Promise<T>,
  statusCode = 200
): Promise<Response> {
  try {
    const data = await handler();
    return jsonResponse(successResponse(data), statusCode);
  } catch (error) {
    return handleServiceError(error);
  }
}
