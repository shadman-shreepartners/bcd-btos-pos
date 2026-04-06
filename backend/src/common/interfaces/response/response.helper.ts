import { UniformResponse, PaginationMeta } from './response.interface';

// Static factory methods for constructing UniformResponse
export class ResponseHelper {
  static success<T>(
    data: T,
    message = 'Success',
    meta: Record<string, unknown> | null = null,
  ): UniformResponse<T> {
    return { success: true, message, meta, data };
  }

  // Paginated response
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success',
  ): UniformResponse<T[]> {
    const meta: PaginationMeta = { page, limit, total, current: data.length };
    return { success: true, message, meta, data };
  }

  // Error response
  static error(
    message = 'Something went wrong',
    meta: Record<string, unknown> | null = null,
  ): UniformResponse<null> {
    return { success: false, message, meta, data: null };
  }
}
