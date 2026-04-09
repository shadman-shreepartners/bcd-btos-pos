import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
//import * as request from 'supertest';
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

describe('JAL Retrieve (e2e)', () => {
  let app: INestApplication;
  const getRecordDetailFromProjectAsync = jest.fn();

  beforeAll(async () => {
    process.env.JAL_SOAP_WSDL_URL ??= 'https://example.com/jal-mock.wsdl';
    process.env.JAL_SOAP_CORPORATE_ID ??= 'C0050874';

    const moduleFixture = await Test.createTestingModule({
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
        getRecordDetailFromProjectAsync,
      })
      .compile();

    app = moduleFixture.createNestApplication();
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

  afterEach(() => {
    getRecordDetailFromProjectAsync.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  // TODO: Add tests for retrieveBooking
  /* describe('POST /api/v1/integrations/jal/retrieve', () => {
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

      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: 'M5555J260300050' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.projectNumber).toBe('M5555J260300050');
          expect(res.body.data.reservations).toHaveLength(1);
          expect(res.body.data.reservations[0].projectNumber).toBe(
            'M5555J260300050',
          );
          expect(res.body.data.reservations[0].passengers).toHaveLength(1);
          expect(res.body.data.reservations[0].passengers[0].surname)
            .toBe()
          ).toBe('TANAKA');
          expect(
            res.body.data.reservations[0].passengers[0].flights[0]
              .flightNumber,
          ).toBe('JL123');
        });
    });

    it('should return 400 when projectNumber is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/retrieve')
        .send({})
        .expect(400);
    });

    it('should return 400 when projectNumber is empty string', () => {
      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: '' })
        .expect(400);
    });

    it('should return 503 when SOAP throws', async () => {
      getRecordDetailFromProjectAsync.mockRejectedValue(new Error('SOAP fault'));

      return request(app.getHttpServer())
        .post('/api/v1/integrations/jal/retrieve')
        .send({ projectNumber: 'PN-ERR' })
        .expect(503);
    });
  });*/
});
