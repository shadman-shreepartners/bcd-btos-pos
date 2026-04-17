import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  ProviderErrorException,
  ProviderTimeoutException,
  ProviderUnavailableException,
} from '../exceptions';
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

    const message = this.extractMessage(exception);
    const errorCode = this.resolveErrorCode(exception);

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

  private resolveErrorCode(exception: unknown): ErrorCode {
    if (exception instanceof NotFoundException) return 'RESOURCE_NOT_FOUND';
    if (exception instanceof BadRequestException) return 'VALIDATION_FAILED';
    if (
      exception instanceof ServiceUnavailableException ||
      exception instanceof ProviderErrorException ||
      exception instanceof ProviderTimeoutException ||
      exception instanceof ProviderUnavailableException
    )
      return 'UPSTREAM_UNAVAILABLE';
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
    if (status === 502) return 'Bad Gateway';
    if (status === 503) return 'Service Unavailable';
    if (status === 504) return 'Gateway Timeout';
    return status >= 500 ? 'Internal Server Error' : 'Request Failed';
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
