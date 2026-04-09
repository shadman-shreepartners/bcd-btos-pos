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
import { JAL_SOAP_CLIENT } from '../../src/modules/integrations/jal/constants/jal-soap.constants';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JAL_CONFIG_ENV } from '../fixtures/jal.fixture';
import { UniformResponse } from '../../src/common/interfaces/response';

describe('JAL Retrieve (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;
  const getRecordDetailFromProjectAsync = jest.fn();

  beforeAll(async () => {
    Object.assign(process.env, {
      PORT: '3004',
      NODE_ENV: 'test',
      ...JAL_CONFIG_ENV,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
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
      .overrideProvider(JAL_SOAP_CLIENT)
      .useValue({
        getRecordDetailFromProjectAsync,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  afterEach(() => {
    getRecordDetailFromProjectAsync.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/integrations/jal/retrieve', () => {
    it('should return mapped reservations in UniformResponse', async () => {
      getRecordDetailFromProjectAsync.mockResolvedValue([
        {
          getRecordDetailFromProjectReturn: {
            ReservationInfo: {
              projectNumber: 'M5555J260300050',
              PassengerInfo: {
                lastNameRomaji: 'TANAKA',
                firstNameRomaji: 'TARO',
                FlightInfo: {
                  flightNumber: 'JL123',
                  departureCode: 'HND',
                  arrivalCode: 'ITM',
                },
              },
            },
          },
        },
      ]);

      return request(server)
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: 'M5555J260300050' })
        .expect(201)
        .expect((res: request.Response) => {
          const body = res.body as UniformResponse<Record<string, unknown>>;
          expect(body.success).toBe(true);

          const data = body.data as Record<string, unknown>;
          expect(data.projectNumber).toBe('M5555J260300050');

          const reservations = data.reservations as Record<string, unknown>[];
          expect(reservations).toHaveLength(1);
          expect(reservations[0].projectNumber).toBe('M5555J260300050');

          const passengers = reservations[0].passengers as Record<
            string,
            unknown
          >[];
          expect(passengers).toHaveLength(1);
          expect(passengers[0].surname).toBe('TANAKA');

          const flights = passengers[0].flights as Record<string, unknown>[];
          expect(flights[0].flightNumber).toBe('JL123');
        });
    });

    it('should return 400 when projectNumber is missing', () => {
      return request(server)
        .post('/api/v1/integrations/jal/retrieve')
        .send({})
        .expect(400);
    });

    it('should return 400 when projectNumber is empty string', () => {
      return request(server)
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: '' })
        .expect(400);
    });

    it('should return 503 when SOAP throws', async () => {
      getRecordDetailFromProjectAsync.mockRejectedValue(
        new Error('SOAP fault'),
      );

      return request(server)
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: 'PN-ERR' })
        .expect(503);
    });
  });
});
