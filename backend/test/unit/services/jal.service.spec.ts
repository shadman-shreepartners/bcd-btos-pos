import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JalService } from '../../../src/modules/integrations/jal/jal.service';
import { JalSoapClient } from '../../../src/modules/integrations/jal/jal-soap.client';
import {
  configServiceMock,
  mockGetOrThrow,
  resetMockGetOrThrow,
} from '../../mocks/config-service.mock';
import { pinoLoggerMock } from '../../mocks/pino-logger.mock';
import {
  validSsoRequest,
  minimalSsoRequest,
  fullSsoRequest,
  specialCharsRequest,
  JAL_CONFIG_KEYS,
} from '../../fixtures/jal.fixture';

const mockRetrieveByProjectNumber = jest.fn();

describe('JalService', () => {
  let service: JalService;

  beforeEach(async () => {
    resetMockGetOrThrow();

    const module = await Test.createTestingModule({
      providers: [
        JalService,
        { provide: ConfigService, useFactory: configServiceMock },
        {
          provide: JalSoapClient,
          useValue: {
            retrieveByProjectNumber: mockRetrieveByProjectNumber,
          },
        },
        pinoLoggerMock(JalService.name),
      ],
    }).compile();

    service = module.get(JalService);
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
      service.buildSsoPayload(validSsoRequest);

      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_SSO_URL');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_SEAMLESS_ID');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACCESS_CODE');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACUD_ID');
      expect(mockGetOrThrow).toHaveBeenCalledWith('JAL_ACUD_PASSWORD');
    });

    it('should throw when config value is missing', () => {
      mockGetOrThrow.mockImplementation(() => {
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

    it.each(JAL_CONFIG_KEYS)(
      'should throw when %s config key is missing',
      (missingKey) => {
        mockGetOrThrow.mockImplementation((key: string) => {
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

  describe('retrieveBooking', () => {
    it('should call SOAP client and return mapped DTO', async () => {
      const soapBody = {
        getRecordDetailFromProjectReturn: {
          ReservationInfo: {
            projectNumber: 'M5555J260300050',
            PassengerInfo: {
              lastNameRomaji: 'TANAKA',
              firstNameRomaji: 'TARO',
              FlightInfo: { flightNumber: 'JL123', departureCode: 'HND' },
            },
          },
        },
      };
      mockRetrieveByProjectNumber.mockResolvedValue(soapBody);

      const result = await service.retrieveBooking({
        projectNumber: 'M5555J260300050',
      });

      expect(mockRetrieveByProjectNumber).toHaveBeenCalledWith(
        'M5555J260300050',
      );
      expect(result.reservationInfo).toHaveLength(1);
      const res = result.reservationInfo[0];
      expect(res.projectNumber).toBe('M5555J260300050');
      expect(res.passengers[0].lastNameRomaji).toBe('TANAKA');
      expect(res.passengers[0].firstNameRomaji).toBe('TARO');
      expect(res.passengers[0].flights[0].flightNumber).toBe('JL123');
      expect(res.passengers[0].flights[0].departureCode).toBe('HND');
    });

    it('should return empty reservationInfo when SOAP returns null', async () => {
      mockRetrieveByProjectNumber.mockResolvedValue(null);

      const result = await service.retrieveBooking({
        projectNumber: 'PN-EMPTY',
      });

      expect(result.reservationInfo).toEqual([]);
    });

    it('should propagate ServiceUnavailableException from SOAP client', async () => {
      const { ServiceUnavailableException } = await import('@nestjs/common');
      mockRetrieveByProjectNumber.mockRejectedValue(
        new ServiceUnavailableException('JAL SOAP retrieve failed'),
      );

      await expect(
        service.retrieveBooking({ projectNumber: 'PN-FAIL' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
