import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseHelper, UniformResponse } from '../interfaces/response';

/**
 * Auto-wraps all successful controller responses in UniformResponse envelope.
 * Registered globally in main.ts. Errors are handled by HttpExceptionFilter.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<UniformResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Avoid double-wrapping if controller already returned UniformResponse
        if (this.isUniformResponse(data)) {
          return data;
        }
        return ResponseHelper.success(data);
      }),
    );
  }

  // Type guard — checks all 4 required UniformResponse fields
  private isUniformResponse(data: unknown): data is UniformResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'message' in data &&
      'meta' in data &&
      'data' in data
    );
  }
}
