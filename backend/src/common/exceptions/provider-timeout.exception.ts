import { HttpException, HttpStatus } from '@nestjs/common';

/** Thrown when an external provider call exceeds the configured timeout */
export class ProviderTimeoutException extends HttpException {
  constructor(
    public readonly provider: string,
    public readonly endpoint: string,
    public readonly timeoutMs: number,
  ) {
    super(
      `Provider ${provider} timed out after ${timeoutMs}ms calling ${endpoint}`,
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}
