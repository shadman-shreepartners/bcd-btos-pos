import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JAL_CONFIG_ENV } from '../fixtures/jal.fixture';

function defaultGetOrThrow(key: string): string {
  const value = JAL_CONFIG_ENV[key];
  if (value === undefined) throw new Error(`Config key not found: ${key}`);
  return value;
}

/** Tests call `.mockImplementation()` on this directly — avoids `jest.spyOn` on overloaded `getOrThrow`. */
export const mockGetOrThrow = jest
  .fn<(key: string) => string>()
  .mockImplementation(defaultGetOrThrow);

/** Reset between tests (`jest.fn` has no reliable `mockRestore` for implementation). */
export function resetMockGetOrThrow(): void {
  mockGetOrThrow.mockClear();
  mockGetOrThrow.mockImplementation(defaultGetOrThrow);
}

export const configServiceMock = (): Partial<ConfigService> => ({
  getOrThrow: mockGetOrThrow as unknown as ConfigService['getOrThrow'],
});
