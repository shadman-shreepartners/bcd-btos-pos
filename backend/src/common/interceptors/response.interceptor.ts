import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse, ResponseHelper } from '../interfaces/response';

/**
 * Auto-wraps successful controller responses in API success envelope.
 * Registered in AppModule via APP_INTERCEPTOR token (DI-based). Errors are handled by HttpExceptionFilter.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Avoid double-wrapping if controller already returned API response
        if (this.isApiResponse(data)) {
          return data;
        }
        return ResponseHelper.success(data);
      }),
    );
  }

  // Type guard — checks required API response fields.
  private isApiResponse(data: unknown): data is ApiResponse<unknown> {
    if (typeof data !== 'object' || data === null || !('success' in data)) {
      return false;
    }

    if ((data as { success: boolean }).success === true) {
      return 'message' in data && 'data' in data;
    }

    return 'error' in data && 'data' in data && 'meta' in data;
  }
}
