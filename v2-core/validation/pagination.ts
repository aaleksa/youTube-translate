import { ApiError } from '../errors';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export interface ParsedPagination {
  limit: number;
  offset: number;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  options: { defaultLimit?: number; maxLimit?: number } = {}
): ParsedPagination {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;

  const limitRaw = searchParams.get('limit');
  const offsetRaw = searchParams.get('offset');

  let limit = defaultLimit;
  if (limitRaw !== null && limitRaw !== '') {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new ApiError(
        'limit must be a positive integer',
        400,
        'INVALID_PAGINATION'
      );
    }
    limit = Math.min(parsed, maxLimit);
  }

  let offset = 0;
  if (offsetRaw !== null && offsetRaw !== '') {
    const parsed = Number(offsetRaw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new ApiError(
        'offset must be a non-negative integer',
        400,
        'INVALID_PAGINATION'
      );
    }
    offset = parsed;
  }

  return { limit, offset };
}

export function toPaginatedResponse<T>(
  items: T[],
  total: number,
  pagination: ParsedPagination
) {
  return {
    items,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    hasMore: pagination.offset + items.length < total,
  };
}
