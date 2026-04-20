import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import http from 'http';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validate } from '../../src/config/env.validation';
import { IntegrationsModule } from '../../src/modules/integrations/integrations.module';
import { AppController } from '../../src/app.controller';
import { JAL_CONFIG_ENV } from '../fixtures/jal.fixture';
import { EKISPERT_CONFIG_ENV } from '../fixtures/ekispert.fixture';
import { HttpClientModule } from '../../src/common/http/http-client.module';
import { AppService } from '../../src/app.service';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../src/common/filter/http-exception.filter';
import { JAL_SOAP_CLIENT } from '../../src/modules/integrations/jal/constants/jal-soap.constants';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponse } from '../../src/common/interfaces/response';

function asApiResponse<T>(value: unknown): ApiResponse<T> {
  return value as ApiResponse<T>;
}

describe('JAL SSO (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;

  beforeAll(async () => {
    // Inject test env vars so zod validate() sees them in process.env
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
      .overrideProvider(JAL_SOAP_CLIENT)
      .useValue({ getRecordDetailFromProjectAsync: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/integrations/jal/sso', () => {
    it('should return form fields in ApiResponse on valid request', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'XC0050870', corpId: 'M5555' })
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          const data = body.data as Record<string, unknown>;
          expect(data.targetUrl).toBeDefined();
          expect(data.method).toBe('POST');
          expect(data.contentType).toBe('application/x-www-form-urlencoded');

          const fields = data.fields as Record<string, unknown>;
          expect(fields).toBeDefined();
          expect(fields.id).toBe('XC0050870');
          expect(fields.projectnumber).toMatch(/^M5555J\d{9}$/);
        });
    });

    it('should return form fields with only required id', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'TESTUSER', corpId: 'M5555' })
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          const data = body.data as Record<string, unknown>;
          const fields = data.fields as Record<string, unknown>;
          expect(fields.id).toBe('TESTUSER');
        });
    });

    it('should return 400 on empty body', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({})
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 when id is missing', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ projectNumber: 'PROJ123' })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 on unknown fields (forbidNonWhitelisted)', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'USER1', corpId: 'M5555', hackerField: 'malicious' })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 when id is empty string', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ id: '' })
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(false);
        });
    });

    it('should return consistent error shape on validation failure', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({})
        .expect(400)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body).toEqual(
            expect.objectContaining({
              success: false,
              data: null,
              error: expect.objectContaining({
                code: 'VALIDATION_FAILED',
                status: 400,
                title: 'Bad Request',
              }),
            }),
          );
        });
    });

    it('should return 201 with all optional fields provided', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({
          id: 'XC0050870',
          corpId: 'M5555',
          password: 'pass123',
          prmSurName: 'TANAKA',
          prmFirstName: 'TARO',
          sectionCode: 'SEC001',
          issueable: 'Y',
          returnUrl: 'https://btos.example.com/callback',
        })
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          const data = body.data as Record<string, unknown>;
          const fields = data.fields as Record<string, unknown>;
          expect(fields.prmSurName).toBe('TANAKA');
          expect(fields.prmFirstName).toBe('TARO');
          expect(fields.returnurl).toBe('https://btos.example.com/callback');
        });
    });

    it('should handle special characters in field values', () => {
      return request(server)
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'XC005&0870', corpId: 'M5555', prmSurName: '田中' })
        .expect(201)
        .expect((res: request.Response) => {
          const body = asApiResponse<Record<string, unknown>>(res.body);
          expect(body.success).toBe(true);

          const data = body.data as Record<string, unknown>;
          const fields = data.fields as Record<string, unknown>;
          expect(fields.id).toBe('XC005&0870');
          expect(fields.prmSurName).toBe('田中');
        });
    });
  });
});
