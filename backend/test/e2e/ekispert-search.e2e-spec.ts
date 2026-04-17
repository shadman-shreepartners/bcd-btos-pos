import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import http from 'http';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validate } from '../../src/config/env.validation';
import { IntegrationsModule } from '../../src/modules/integrations/integrations.module';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../src/common/filter/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponse } from '../../src/common/interfaces/response';
import { HttpClientModule } from '../../src/common/http/http-client.module';
import { HttpClientService } from '../../src/common/http/http-client.service';
import { JAL_CONFIG_ENV } from '../fixtures/jal.fixture';
import {
  EKISPERT_CONFIG_ENV,
  EKISPERT_RAW_SINGLE_RESPONSE,
  EKISPERT_SEARCH_REQUEST,
} from '../fixtures/ekispert.fixture';

function asApiResponse<T>(value: unknown): ApiResponse<T> {
  return value as ApiResponse<T>;
}

const httpClientGetMock = jest.fn();

describe('Ekispert search (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;

  beforeAll(async () => {
    Object.assign(process.env, {
      PORT: '3004',
      NODE_ENV: 'test',
      ...JAL_CONFIG_ENV,
      ...EKISPERT_CONFIG_ENV,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        HttpClientModule,
        IntegrationsModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
          }),
        },
      ],
    })
      .overrideProvider(HttpClientService)
      .useValue({ get: httpClientGetMock })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  beforeEach(() => {
    httpClientGetMock.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/integrations/ekispert/search', () => {
    it('returns a wrapped success response and uses default upstream params', () => {
      httpClientGetMock.mockResolvedValue(EKISPERT_RAW_SINGLE_RESPONSE);

      return request(server)
        .post('/api/v1/integrations/ekispert/search')
        .send(EKISPERT_SEARCH_REQUEST)
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          if (body.success) {
            expect(body.message).toBe('Routes retrieved successfully');
          }

          const data = body.data as Record<string, unknown>;
          const courses = data.courses as Record<string, unknown>[];
          expect(courses).toHaveLength(1);

          const firstCourse = courses[0];
          expect(firstCourse.serializeData).toBe(
            'SerializeData=viaList%3D%E6%9D%B1%E4%BA%AC%3A%E5%A4%A7%E9%98%AA&token=abc123',
          );

          const route = firstCourse.route as Record<string, unknown>;
          expect(route.timeOnBoard).toBe(60);
          expect(route.distance).toBe(1234);

          const line = (route.lines as Record<string, unknown>[])[0];
          expect(line.departure).toBe('2026-05-01T09:00:00+09:00');
          expect(line.arrival).toBe('2026-05-01T10:15:00+09:00');

          const prices = firstCourse.prices as Record<string, unknown>;
          expect(prices.breakdown).toHaveLength(2);
          expect(
            (prices.breakdown as Record<string, unknown>[])[0].selected,
          ).toBe(true);
          expect(
            (prices.breakdown as Record<string, unknown>[])[1].selected,
          ).toBe(false);
        })
        .expect(() => {
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
        });
    });

    it('returns 400 when a required field is missing', () => {
      return request(server)
        .post('/api/v1/integrations/ekispert/search')
        .send({ destination: '大阪', date: '20260501', time: '0900' })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);

          if (!body.success) {
            expect(body.error).toEqual(
              expect.objectContaining({
                code: 'VALIDATION_FAILED',
                status: 400,
              }),
            );
          }
        });
    });

    it('returns 400 on unknown fields', () => {
      return request(server)
        .post('/api/v1/integrations/ekispert/search')
        .send({
          origin: '東京',
          destination: '大阪',
          date: '20260501',
          time: '0900',
          hackerField: 'malicious',
        })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('returns 400 for an invalid answerCount boundary', () => {
      return request(server)
        .post('/api/v1/integrations/ekispert/search')
        .send({
          origin: '東京',
          destination: '大阪',
          date: '20260501',
          time: '0900',
          answerCount: 11,
        })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('returns 503 when the upstream call fails', () => {
      httpClientGetMock.mockRejectedValue(new Error('timeout'));

      return request(server)
        .post('/api/v1/integrations/ekispert/search')
        .send(EKISPERT_SEARCH_REQUEST)
        .expect(503)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);

          if (!body.success) {
            expect(body.error).toEqual(
              expect.objectContaining({
                code: 'UPSTREAM_UNAVAILABLE',
                status: 503,
              }),
            );
          }
        });
    });
  });
});
