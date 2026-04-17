import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import http from 'http';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { HttpExceptionFilter } from '../../src/common/filter/http-exception.filter';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { ApiResponse } from '../../src/common/interfaces/response';
import { validate } from '../../src/config/env.validation';
import { AnaModule } from '../../src/modules/integrations/ana/ana.module';
import { AnaSsoRequestDto } from '../../src/modules/integrations/ana/dto/ana-sso-request.dto';
import { AnaSsoResponseDto } from '../../src/modules/integrations/ana/dto/ana-sso-response.dto';
import { AnaCredentialRecord } from '../../src/modules/integrations/ana/types/ana.types';

function asApiResponse<T>(value: unknown): ApiResponse<T> {
  return value as ApiResponse<T>;
}

const describeRealAnaSso =
  process.env.RUN_ANA_REAL_E2E === 'true' ? describe : describe.skip;

describeRealAnaSso('ANA SSO real credentials (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;
  let configService: ConfigService;

  beforeAll(async () => {
    Object.assign(process.env, {
      PORT: process.env.PORT ?? '3004',
      NODE_ENV: process.env.NODE_ENV ?? 'test',
      // Required by shared env validation but unused by this ANA test.
      JAL_SSO_URL: process.env.JAL_SSO_URL ?? 'https://jal-sso.example.com/sso',
      JAL_SEAMLESS_ID: process.env.JAL_SEAMLESS_ID ?? 'TEST_SEAMLESS_ID',
      JAL_ACCESS_CODE: process.env.JAL_ACCESS_CODE ?? 'TEST_ACCESS_CODE',
      JAL_ACUD_ID: process.env.JAL_ACUD_ID ?? 'TEST_ACUD_ID',
      JAL_ACUD_PASSWORD: process.env.JAL_ACUD_PASSWORD ?? 'TEST_ACUD_PASSWORD',
      JAL_SOAP_WSDL_URL:
        process.env.JAL_SOAP_WSDL_URL ?? 'https://example.com/jal-mock.wsdl',
      JAL_SOAP_CORPORATE_ID:
        process.env.JAL_SOAP_CORPORATE_ID ?? 'C0050874',
      EKISPERT_API_KEY: process.env.EKISPERT_API_KEY ?? 'dummy-key',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
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
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should build ANA form payload from a DTO request and real env credentials', () => {
    const credentials =
      configService.get<AnaCredentialRecord[]>('ANA_SSO_CREDENTIALS') ?? [];
    const credential = credentials.find(
      (entry) =>
        entry.companyId === process.env.ANA_REAL_COMPANY_ID &&
        entry.employeeId === process.env.ANA_REAL_EMPLOYEE_ID,
    ) ?? credentials[0];

    if (!credential) {
      throw new Error(
        [
          'Set ANA_SSO_CREDENTIALS in .env before running this real-credentials test.',
          'Optional DTO overrides: ANA_REAL_COMPANY_ID, ANA_REAL_EMPLOYEE_ID, ANA_REAL_PROJECT_NUMBER, ANA_REAL_DATE_FLIGHT1, ANA_REAL_DATE_FLIGHT2.',
        ].join(' '),
      );
    }

    const dto: AnaSsoRequestDto = {
      companyId: process.env.ANA_REAL_COMPANY_ID ?? credential.companyId,
      employeeId: process.env.ANA_REAL_EMPLOYEE_ID ?? credential.employeeId,
      projectNumber: process.env.ANA_REAL_PROJECT_NUMBER ?? 'TEST000001',
      dateFlight1: process.env.ANA_REAL_DATE_FLIGHT1 ?? '',
      dateFlight2: process.env.ANA_REAL_DATE_FLIGHT2 ?? '',
    };

    return request(server)
      .post('/api/v1/integrations/ana/sso')
      .send(dto)
      .expect(201)
      .expect((res: request.Response) => {
        const body = asApiResponse<AnaSsoResponseDto>(res.body);

        expect(body.success).toBe(true);

        if (!body.success) {
          throw new Error('Expected success response');
        }

        expect(body.data.method).toBe('POST');
        expect(body.data.contentType).toBe('multipart/form-data');
        expect(body.data.targetUrl).toBe(
          configService.getOrThrow<string>('ANA_SSO_URL'),
        );

        expect(body.data.fields).toMatchObject({
          loginId: credential.loginId,
          adminUserId: credential.adminUserId,
          userId: credential.userId,
          companyManagementCd1: dto.projectNumber.slice(-10),
          companyManagementCd2: credential.userId,
          companyManagementCd3: credential.corpCode.slice(0, 6),
          sendDataFlg: '1',
          sendDataUrl: configService.getOrThrow<string>('ANA_SEND_DATA_URL'),
          sendDataType: '1',
          dateFlight1: dto.dateFlight1,
          dateFlight2: dto.dateFlight2,
        });

        expect(body.data.fields.loginPw).toBeTruthy();
        expect(body.data.fields.passwd).toBeTruthy();
      });
  });
});
