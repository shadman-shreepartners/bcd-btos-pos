import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JalService } from '../../../src/modules/integrations/jal/jal.service';
import { JalSoapClient } from '../../../src/modules/integrations/jal/jal-soap.client';
//import { JalRetrieveResponseDto } from '../../../src/modules/integrations/jal/dto/jal-retrieve-response.dto';
import {
  configServiceMock,
  mockGetOrThrow,
  resetMockGetOrThrow,
} from '../../../test/mocks/config-service.mock';
import { pinoLoggerMock } from '../../../test/mocks/pino-logger.mock';
import {
  validSsoRequest,
  minimalSsoRequest,
  fullSsoRequest,
  specialCharsRequest,
  JAL_CONFIG_KEYS,
} from '../../../test/fixtures/jal.fixture';

describe('JalService', () => {
  let service: JalService;
  const retrieveByProjectNumber: jest.MockedFunction<
    JalSoapClient['retrieveByProjectNumber']
  > = jest.fn();

  beforeEach(async () => {
    retrieveByProjectNumber.mockReset();
    resetMockGetOrThrow();

    const module = await Test.createTestingModule({
      providers: [
        JalService,
        { provide: ConfigService, useFactory: configServiceMock },
        {
          provide: JalSoapClient,
          useValue: { retrieveByProjectNumber } satisfies Pick<
            JalSoapClient,
            'retrieveByProjectNumber'
          >,
        },
        pinoLoggerMock(JalService.name),
      ],
    }).compile();

    service = module.get<JalService>(JalService);
  });

  describe('buildSsoPayload', () => {
    it('should return form payload with config credentials merged', () => {
      const result = service.buildSsoPayload(validSsoRequest);

      expect(result.targetUrl).toBe('https://jal-sso.example.com/sso');
      expect(result.method).toBe('POST');
      expect(result.contentType).toBe('application/x-www-form-urlencoded');
      expect(result.fields.seamlessid).toBe('TEST_SEAMLESS_ID');
      expect(result.fields.accesscode).toBe('TEST_ACCESS_CODE');
      expect(result.fields.id).toBe('XC0050870');
      expect(result.fields.acudId).toBe('TEST_ACUD_ID');
      expect(result.fields.acudPassword).toBe('TEST_ACUD_PASSWORD');
      expect(result.fields.projectnumber).toBe('M5555J260300050');
    });

    it('should read all 5 config values via getOrThrow', () => {
      mockGetOrThrow.mockClear();
      service.buildSsoPayload(validSsoRequest);

      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_SSO_URL');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_SEAMLESS_ID');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACCESS_CODE');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACUD_ID');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACUD_PASSWORD');
    });

    it('should throw when config value is missing', () => {
      mockGetOrThrow.mockImplementation((): never => {
        throw new Error('Missing config');
      });

      expect(() => service.buildSsoPayload(validSsoRequest)).toThrow(
        'Missing config',
      );
    });

    it('should handle request with only required field (id)', () => {
      const result = service.buildSsoPayload(minimalSsoRequest);

      expect(result.fields.id).toBe('MINIMAL_USER');
      expect(result.fields.projectnumber).toBeUndefined();
      expect(result.fields.prmSurName).toBeUndefined();
    });

    it('should include all optional fields when every field is provided', () => {
      const result = service.buildSsoPayload(fullSsoRequest);

      expect(result.fields.id).toBe('XC0050870');
      expect(result.fields.password).toBe('pass123');
      expect(result.fields.prmSurName).toBe('TANAKA');
      expect(result.fields.prmFirstName).toBe('TARO');
      expect(result.fields.sectionCode).toBe('SEC001');
      expect(result.fields.issueable).toBe('Y');
      expect(result.fields.projectnumber).toBe('M5555J260300050');
      expect(result.fields.returnurl).toBe('https://btos.example.com/callback');
    });

    it('should preserve special characters in field values', () => {
      const result = service.buildSsoPayload(specialCharsRequest);

      expect(result.fields.id).toBe('XC005&0870');
      expect(result.fields.password).toBe('p@ss=123&key');
      expect(result.fields.prmSurName).toBe('田中');
      expect(result.fields.prmFirstName).toBe('太郎');
    });

    it.each([...JAL_CONFIG_KEYS])(
      'should throw when %s config key is missing',
      (missingKey: string) => {
        mockGetOrThrow.mockImplementation((key: string): string => {
          if (key === missingKey) {
            throw new Error(`Missing config: ${missingKey}`);
          }
          return 'mock-value';
        });

        expect(() => service.buildSsoPayload(validSsoRequest)).toThrow(
          `Missing config: ${missingKey}`,
        );
      },
    );
  });

  // TODO: Add tests for retrieveBooking
  /*describe('retrieveBooking', () => {
    it('should map SOAP result via jalSoapClient', async () => {
      retrieveByProjectNumber.mockResolvedValue({
        ReservationInfo: {
          ProjectNumber: 'PN-UNIT',
          PassengerInfo: { prmSurName: 'SATO' },
        },
      } as Awaited<ReturnType<JalSoapClient['retrieveByProjectNumber']>>);

      const result: JalRetrieveResponseDto = await service.retrieveBooking({
        projectNumber: 'PN-UNIT',
      });

      expect(retrieveByProjectNumber).toHaveBeenCalledWith('PN-UNIT');
      expect(result.projectNumber).toBe('PN-UNIT');
      expect(result.reservations).toHaveLength(1);
      expect(result.reservations[0].passengers[0].surname).toBe('SATO');
    });

    it('should propagate SOAP client failures', async () => {
      retrieveByProjectNumber.mockRejectedValue(new Error('unavailable'));

      await expect(
        service.retrieveBooking({ projectNumber: 'PN-FAIL' }),
      ).rejects.toThrow('unavailable');
    });
  });*/
});
