export function isNetworkRequestError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    return /failed to fetch|network|load failed/i.test(error.message);
  }

  return false;
}
