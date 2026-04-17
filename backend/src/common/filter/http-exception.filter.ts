import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ErrorCode } from '../constants/error-codes';
import { ResponseHelper } from '../interfaces/response';

/**
 * Global exception filter — catches all thrown exceptions.
 * Converts them into structured API error responses.
 * Never exposes stack traces or internal details.
 */
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Known NestJS exceptions keep their status; unknown exceptions get 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception, status);
    const errorCode = this.resolveErrorCode(status);

    if (status >= 500) {
      this.logger.error(
        {
          err:
            exception instanceof Error ? exception.message : String(exception),
          status,
        },
        'Unhandled server error',
      );
    } else if (status >= 400) {
      this.logger.warn({ status, message, errorCode }, 'Client error');
    }

    response.status(status).json(
      ResponseHelper.error({
        code: errorCode,
        detail: message,
        instance: request.url,
        status,
        title: this.resolveProblemTitle(status),
        type: this.resolveProblemType(status),
      }),
    );
  }

  private resolveErrorCode(status: number): ErrorCode {
    if (status === 401) return 'AUTH_UNAUTHORIZED';
    if (status === 403) return 'AUTH_FORBIDDEN';
    if (status === 404) return 'RESOURCE_NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 400) return 'VALIDATION_FAILED';
    if (status === 503) return 'UPSTREAM_UNAVAILABLE';
    return 'INTERNAL_ERROR';
  }

  private resolveProblemType(status: number): string {
    return `https://httpstatuses.com/${status}`;
  }

  private resolveProblemTitle(status: number): string {
    if (status === 400) return 'Bad Request';
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    if (status === 404) return 'Resource Not Found';
    if (status === 409) return 'Conflict';
    if (status === 503) return 'Service Unavailable';
    return status >= 500 ? 'Internal Server Error' : 'Request Failed';
  }

  // Handles three cases: string message, validation array, or unknown (generic 500)
  private extractMessage(exception: unknown, status: number): string {
    if (status >= 500) {
      return 'Internal server error';
    }

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
