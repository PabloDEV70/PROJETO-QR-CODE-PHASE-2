// src/common/pagination/pagination.types.ts

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

export function buildPaginatedResult<T>(args: {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}): PaginatedResult<T> {
  const { data, total, page, perPage } = args;
  const lastPage = Math.max(1, Math.ceil(total / Math.max(1, perPage)));
  const hasMore = page < lastPage;
  return { data, total, page, perPage, lastPage, hasMore };
}

export function wrapAllAsSinglePage<T>(data: T[]): PaginatedResult<T> {
  const total = data.length;
  return {
    data,
    total,
    page: 1,
    perPage: total || 1,
    lastPage: 1,
    hasMore: false,
  };
}
