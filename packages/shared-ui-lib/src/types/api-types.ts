export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
