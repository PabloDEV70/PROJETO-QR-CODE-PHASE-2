/**
 * Standard response wrappers for API endpoints.
 *
 * USE FOR ALL NEW ENDPOINTS:
 *   Lists:       { data: T[], meta: { total, page?, limit? } }
 *   Single item: { data: T }
 *   Error:       { statusCode, error, message, details? }
 */

export interface ListMeta {
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: ListMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export function wrapList<T>(
  data: T[],
  meta: ListMeta,
): ListResponse<T> {
  return { data, meta };
}

export function wrapSingle<T>(data: T): SingleResponse<T> {
  return { data };
}

export function wrapPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): ListResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
