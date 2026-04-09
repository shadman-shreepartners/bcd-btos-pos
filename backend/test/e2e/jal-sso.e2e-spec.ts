import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validate } from '../../src/config/env.validation';
import { IntegrationsModule } from '../../src/modules/integrations/integrations.module';
import { HttpClientModule } from '../../src/common/http/http-client.module';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../src/common/filter/http-exception.filter';
import { JAL_SOAP_CLIENT } from '../../src/modules/integrations/jal/constants/jal-soap.constants';

interface SsoFields {
  id: string;
  projectnumber?: string;
  password?: string;
  prmSurName?: string;
  prmFirstName?: string;
  sectionCode?: string;
  issueable?: string;
  returnurl?: string;
}

interface SsoResponse {
  success: boolean;
  data: {
    targetUrl: string;
    method: string;
    contentType: string;
    fields: SsoFields;
  } | null;
  message?: string;
}

describe('JAL SSO (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    process.env.JAL_SOAP_WSDL_URL ??= 'https://example.com/jal-mock.wsdl';
    process.env.JAL_SOAP_CORPORATE_ID ??= 'C0050874';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          envFilePath: '.env',
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        HttpClientModule,
        IntegrationsModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(JAL_SOAP_CLIENT)
      .useValue({
        getRecordDetailFromProjectAsync: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/integrations/jal/sso', () => {
    it('should return form fields in UniformResponse on valid request', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'XC0050870', projectNumber: 'M5555J260300050' })
        .expect(201)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(true);
          expect(body.data?.targetUrl).toBeDefined();
          expect(body.data?.method).toBe('POST');
          expect(body.data?.contentType).toBe(
            'application/x-www-form-urlencoded',
          );
          expect(body.data?.fields).toBeDefined();
          expect(body.data?.fields.id).toBe('XC0050870');
          expect(body.data?.fields.projectnumber).toBe('M5555J260300050');
        });
    });

    it('should return form fields with only required id', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'TESTUSER' })
        .expect(201)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(true);
          expect(body.data?.fields.id).toBe('TESTUSER');
        });
    });

    it('should return 400 on empty body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 when id is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ projectNumber: 'PROJ123' })
        .expect(400)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 on unknown fields (forbidNonWhitelisted)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'USER1', hackerField: 'malicious' })
        .expect(400)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(false);
        });
    });

    it('should return 400 when id is empty string', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ id: '' })
        .expect(400)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(false);
        });
    });

    it('should return consistent error shape on validation failure', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body).toEqual(
            expect.objectContaining({
              success: false,
              data: null,
            }),
          );
          expect(body.message).toBeDefined();
        });
    });

    it('should return 201 with all optional fields provided', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({
          id: 'XC0050870',
          password: 'pass123',
          prmSurName: 'TANAKA',
          prmFirstName: 'TARO',
          sectionCode: 'SEC001',
          issueable: 'Y',
          projectNumber: 'M5555J260300050',
          returnUrl: 'https://btos.example.com/callback',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(true);
          expect(body.data?.fields.prmSurName).toBe('TANAKA');
          expect(body.data?.fields.prmFirstName).toBe('TARO');
          expect(body.data?.fields.returnurl).toBe(
            'https://btos.example.com/callback',
          );
        });
    });

    it('should handle special characters in field values', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/sso')
        .send({ id: 'XC005&0870', prmSurName: '田中' })
        .expect(201)
        .expect((res) => {
          const body = res.body as SsoResponse;
          expect(body.success).toBe(true);
          expect(body.data?.fields.id).toBe('XC005&0870');
          expect(body.data?.fields.prmSurName).toBe('田中');
        });
    });
  });
});
