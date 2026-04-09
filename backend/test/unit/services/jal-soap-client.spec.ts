import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { JalSoapClient } from '../../../src/modules/integrations/jal/jal-soap.client';
import { JAL_SOAP_CLIENT } from '../../../src/modules/integrations/jal/constants/jal-soap.constants';
import { pinoLoggerMock } from '../../mocks/pino-logger.mock';

describe('JalSoapClient', () => {
  const mockAsync = jest.fn();

  function buildClient(soapClient: unknown) {
    return Test.createTestingModule({
      providers: [
        JalSoapClient,
        { provide: JAL_SOAP_CLIENT, useValue: soapClient },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              if (key === 'JAL_SOAP_RETRIEVE_OPERATION') return fallback;
              if (key === 'JAL_SOAP_TIMEOUT_MS') return 5000;
              return fallback;
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'JAL_SOAP_CORPORATE_ID') return 'CORP001';
              throw new Error(`Missing: ${key}`);
            }),
          },
        },
        pinoLoggerMock(JalSoapClient.name),
      ],
    }).compile();
  }

  afterEach(() => mockAsync.mockReset());

  // ── null client ──────────────────────────────────────────────────────
  it('should throw ServiceUnavailableException when SOAP client is null', async () => {
    const module = await buildClient(null);
    const client = module.get(JalSoapClient);

    await expect(client.retrieveByProjectNumber('PN1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  // ── missing operation ────────────────────────────────────────────────
  it('should throw ServiceUnavailableException when operation is missing', async () => {
    const module = await buildClient({ someOtherAsync: jest.fn() });
    const client = module.get(JalSoapClient);

    await expect(client.retrieveByProjectNumber('PN1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  // ── happy path ───────────────────────────────────────────────────────
  it('should return SOAP body on success', async () => {
    const expected = { ReservationInfo: { projectNumber: 'PN1' } };
    mockAsync.mockResolvedValue([expected]);

    const module = await buildClient({
      getRecordDetailFromProjectAsync: mockAsync,
    });
    const client = module.get(JalSoapClient);

    const result = await client.retrieveByProjectNumber('PN1');

    expect(result).toEqual(expected);
    expect(mockAsync).toHaveBeenCalledWith(
      expect.objectContaining({ in0: 'CORP001', in2: 'PN1' }),
    );
  });

  // ── non-object body → null ───────────────────────────────────────────
  it('should return null when SOAP body is a string', async () => {
    mockAsync.mockResolvedValue(['not-an-object']);

    const module = await buildClient({
      getRecordDetailFromProjectAsync: mockAsync,
    });
    const client = module.get(JalSoapClient);

    const result = await client.retrieveByProjectNumber('PN1');

    expect(result).toBeNull();
  });

  it('should return null when SOAP body is null', async () => {
    mockAsync.mockResolvedValue([null]);

    const module = await buildClient({
      getRecordDetailFromProjectAsync: mockAsync,
    });
    const client = module.get(JalSoapClient);

    const result = await client.retrieveByProjectNumber('PN1');

    expect(result).toBeNull();
  });

  // ── SOAP fault → ServiceUnavailableException ─────────────────────────
  it('should wrap SOAP errors as ServiceUnavailableException', async () => {
    mockAsync.mockRejectedValue(new Error('SOAP fault xyz'));

    const module = await buildClient({
      getRecordDetailFromProjectAsync: mockAsync,
    });
    const client = module.get(JalSoapClient);

    await expect(client.retrieveByProjectNumber('PN1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  // ── timeout → ServiceUnavailableException ────────────────────────────
  it('should throw ServiceUnavailableException on timeout', async () => {
    mockAsync.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 60_000)),
    );

    // Override ConfigService to use a tiny timeout
    const module = await Test.createTestingModule({
      providers: [
        JalSoapClient,
        {
          provide: JAL_SOAP_CLIENT,
          useValue: { getRecordDetailFromProjectAsync: mockAsync },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              if (key === 'JAL_SOAP_TIMEOUT_MS') return 50; // 50ms timeout
              return fallback;
            }),
            getOrThrow: jest.fn(() => 'CORP001'),
          },
        },
        pinoLoggerMock(JalSoapClient.name),
      ],
    }).compile();

    const client = module.get(JalSoapClient);

    await expect(client.retrieveByProjectNumber('PN1')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
