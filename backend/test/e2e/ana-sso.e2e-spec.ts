import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import http from 'http';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validate } from '../../src/config/env.validation';
import { AnaModule } from '../../src/modules/integrations/ana/ana.module';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../src/common/filter/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponse } from '../../src/common/interfaces/response';
import { ANA_CONFIG_ENV } from '../fixtures/ana.fixture';

function asApiResponse<T>(value: unknown): ApiResponse<T> {
  return value as ApiResponse<T>;
}

describe('ANA SSO (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;

  beforeAll(async () => {
    Object.assign(process.env, {
      PORT: '3004',
      NODE_ENV: 'test',
      ...ANA_CONFIG_ENV,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        AnaModule,
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
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/integrations/ana/sso', () => {
    it('should return ANA form payload in ApiResponse on valid request', () => {
      return request(server)
        .post('/api/v1/integrations/ana/sso')
        .send({
          companyId: 'WEB_CUSTOMER_USERID',
          employeeId: 'WEB_CLIENT_USERID',
          projectNumber: 'M5555A111111111',
          dateFlight1: '20260510',
          dateFlight2: '20260911',
        })
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          if (!body.success) {
            throw new Error('Expected success response');
          }

          expect(body.message).toBe('Form data retrieved successfully');

          const data = body.data;
          expect(data.targetUrl).toBeDefined();
          expect(data.method).toBe('POST');
          expect(data.contentType).toBe('multipart/form-data');

          const fields = data.fields as Record<string, unknown>;
          expect(fields.loginId).toBe('SCL96022');
          expect(fields.companyManagementCd1).toBe('A111111111');
          expect(fields.sendDataUrl).toBe(
            '/api/v1/integrations/ana/sso/callback',
          );
          expect(fields.dateFlight1).toBe('20260510');
          expect(fields.dateFlight2).toBe('20260911');
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(server)
        .post('/api/v1/integrations/ana/sso')
        .send({})
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
          expect((body as { error: { code: string } }).error.code).toBe(
            'VALIDATION_FAILED',
          );
        });
    });

    it('should return 400 on unknown fields', () => {
      return request(server)
        .post('/api/v1/integrations/ana/sso')
        .send({
          companyId: 'WEB_CUSTOMER_USERID',
          employeeId: 'WEB_CLIENT_USERID',
          projectNumber: 'M5555A111111111',
          hackerField: 'malicious',
        })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('should return 404 when credentials are not found', () => {
      return request(server)
        .post('/api/v1/integrations/ana/sso')
        .send({
          companyId: 'UNKNOWN',
          employeeId: 'UNKNOWN',
          projectNumber: 'M5555A111111111',
        })
        .expect(404)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
          expect((body as { error: { code: string } }).error.code).toBe(
            'RESOURCE_NOT_FOUND',
          );
        });
    });
  });
});
