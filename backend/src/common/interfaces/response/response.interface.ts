// Standard API response envelope — every endpoint returns this shape
export interface UniformResponse<T = unknown> {
  success: boolean;
  message: string;
  meta: PaginationMeta | Record<string, unknown> | null;
  data: T | null;
}

// Used by paginated list endpoints
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  current: number;
}
