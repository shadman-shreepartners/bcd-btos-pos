import { ConfigService } from '@nestjs/config';
import { JAL_CONFIG_ENV } from '../fixtures/jal.fixture';

export const mockGetOrThrow = jest.fn((key: string) => {
  const value = JAL_CONFIG_ENV[key];
  if (!value) throw new Error(`Missing config: ${key}`);
  return value;
});

export const resetMockGetOrThrow = () => {
  mockGetOrThrow.mockReset();
  mockGetOrThrow.mockImplementation((key: string) => {
    const value = JAL_CONFIG_ENV[key];
    if (!value) throw new Error(`Missing config: ${key}`);
    return value;
  });
};

export const configServiceMock = (): Partial<ConfigService> => ({
  getOrThrow: mockGetOrThrow,
});
