import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseHelper } from '../interfaces/response';

/**
 * Global exception filter — catches all thrown exceptions.
 * Converts them into UniformResponse error shape.
 * Never exposes stack traces or internal details.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Known NestJS exceptions keep their status; unknown exceptions get 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);

    response.status(status).json(ResponseHelper.error(message));
  }

  // Handles three cases: string message, validation array, or unknown (generic 500)
  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const msg = (response as Record<string, unknown>).message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
    }
    return 'Internal server error';
  }
}
