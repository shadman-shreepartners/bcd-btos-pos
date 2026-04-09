import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ResponseHelper } from '../interfaces/response';

/**
 * Global exception filter — catches all thrown exceptions.
 * Converts them into UniformResponse error shape.
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
    const response = ctx.getResponse<Response>();

    // Known NestJS exceptions keep their status; unknown exceptions get 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);

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
      this.logger.warn({ status, message }, 'Client error');
    }

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
