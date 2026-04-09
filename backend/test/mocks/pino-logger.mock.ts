import { jest } from '@jest/globals';
import { Provider } from '@nestjs/common';
import { getLoggerToken, PinoLogger } from 'nestjs-pino';

/** Token matches `nestjs-pino` `@InjectPinoLogger(context)` via `getLoggerToken`. */
export const pinoLoggerMock = (context: string): Provider => ({
  provide: getLoggerToken(context),
  useValue: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } satisfies Partial<PinoLogger>,
});
