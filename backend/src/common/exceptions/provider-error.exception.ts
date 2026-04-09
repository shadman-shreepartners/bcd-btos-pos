import { HttpException, HttpStatus } from '@nestjs/common';

/** Thrown when an external provider returns a non-success response */
export class ProviderErrorException extends HttpException {
  constructor(
    public readonly provider: string,
    public readonly endpoint: string,
    public readonly statusCode: number,
    public readonly providerMessage?: string,
  ) {
    super(
      `Provider ${provider} returned ${statusCode} from ${endpoint}`,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
