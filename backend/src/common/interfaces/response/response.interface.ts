import { ErrorCode } from '../../constants/error-codes';
export { ErrorCode } from '../../constants/error-codes';

// Standard API response envelope — every endpoint returns this shape
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta | null;
}

export interface ErrorResponse {
  success: false;
  error: ApiProblem;
  data: null;
  meta: null;
}

export interface ApiProblem {
  code: ErrorCode;
  type: string;
  title: string;
  status: number;
  detail?: string;
  field?: string;
  instance?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
