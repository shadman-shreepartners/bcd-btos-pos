import { HttpException, HttpStatus } from '@nestjs/common';

/** Thrown when an external provider is unreachable (connection refused, DNS failure, etc.) */
export class ProviderUnavailableException extends HttpException {
  constructor(
    public readonly provider: string,
    public readonly endpoint: string,
    public readonly reason?: string,
  ) {
    super(
      `Provider ${provider} is unavailable at ${endpoint}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
