import {
  ApiProblem,
  ErrorResponse,
  PaginationMeta,
  SuccessResponse,
} from './response.interface';

// Static factory methods for constructing API responses
export class ResponseHelper {
  static success<T>(
    data: T,
    message = 'Success',
    meta: PaginationMeta | null = null,
  ): SuccessResponse<T> {
    return { success: true, message, data, meta };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success',
  ): SuccessResponse<T[]> {
    const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { success: true, message, data, meta };
  }

  static error(problem: ApiProblem): ErrorResponse {
    return { success: false, error: problem, data: null, meta: null };
  }
}
