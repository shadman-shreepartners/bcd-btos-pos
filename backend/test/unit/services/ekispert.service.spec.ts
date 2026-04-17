import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { EkispertService } from '../../../src/modules/integrations/ekispert/ekispert.service';
import { HttpClientService } from '../../../src/common/http/http-client.service';
import {
  EKISPERT_CONFIG_ENV,
  EKISPERT_RAW_SINGLE_RESPONSE,
  EKISPERT_SEARCH_REQUEST,
  EKISPERT_SEARCH_REQUEST_ARRIVAL,
} from '../../fixtures/ekispert.fixture';

const httpClientGetMock = jest.fn();
const configGetOrThrowMock = jest.fn((key: string) => {
  const value = EKISPERT_CONFIG_ENV[key];
  if (!value) {
    throw new Error(`Missing config: ${key}`);
  }

  return value;
});

describe('EkispertService', () => {
  let service: EkispertService;

  beforeEach(async () => {
    httpClientGetMock.mockReset();
    configGetOrThrowMock.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        EkispertService,
        {
          provide: HttpClientService,
          useValue: {
            get: httpClientGetMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: configGetOrThrowMock,
          },
        },
      ],
    }).compile();

    service = module.get(EkispertService);
  });

  it('builds the default upstream query and maps the response', async () => {
    httpClientGetMock.mockResolvedValue(EKISPERT_RAW_SINGLE_RESPONSE);

    const result = await service.search(EKISPERT_SEARCH_REQUEST);

    expect(configGetOrThrowMock).toHaveBeenCalledWith('EKISPERT_BASE_URL');
    expect(configGetOrThrowMock).toHaveBeenCalledWith('EKISPERT_API_KEY');
    expect(httpClientGetMock).toHaveBeenCalledWith(
      'http://api.ekispert.jp/v1/json/search/course/extreme',
      { provider: 'Ekispert' },
      {
        params: {
          key: 'TEST_EKISPERT_API_KEY',
          viaList: '東京:大阪',
          date: '20260501',
          time: '0900',
          searchType: 'departure',
          answerCount: 5,
          gcs: 'wgs84',
          conditionDetail: 'T2200200000000:F0000000000000:A00000000:',
        },
      },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.message).toBe('Routes retrieved successfully');
      expect(result.data.courses).toHaveLength(1);
      expect(result.data.courses[0].serializeData).toBe(
        'SerializeData=viaList%3D%E6%9D%B1%E4%BA%AC%3A%E5%A4%A7%E9%98%AA&token=abc123',
      );
    }
  });

  it('passes explicit searchType and answerCount through to the upstream query', async () => {
    httpClientGetMock.mockResolvedValue(EKISPERT_RAW_SINGLE_RESPONSE);

    await service.search(EKISPERT_SEARCH_REQUEST_ARRIVAL);

    expect(httpClientGetMock).toHaveBeenCalledWith(
      'http://api.ekispert.jp/v1/json/search/course/extreme',
      { provider: 'Ekispert' },
      {
        params: {
          key: 'TEST_EKISPERT_API_KEY',
          viaList: '東京:大阪',
          date: '20260501',
          time: '0900',
          searchType: 'arrival',
          answerCount: 9,
          gcs: 'wgs84',
          conditionDetail: 'T2200200000000:F0000000000000:A00000000:',
        },
      },
    );
  });

  it('translates upstream failures into ServiceUnavailableException', async () => {
    httpClientGetMock.mockRejectedValue(new Error('timeout'));

    await expect(service.search(EKISPERT_SEARCH_REQUEST)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
