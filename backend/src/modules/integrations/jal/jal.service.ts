import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JalSsoRequestDto } from './dto/jal-sso-request.dto';
import { JalSsoResponseDto } from './dto/jal-sso-response.dto';
import { JalRetrieveRequestDto } from './dto/jal-retrieve-request.dto';
import { JalRetrieveResponseDto } from './dto/jal-retrieve-response.dto';
import { mapSoapToJalRetrieveResponse } from './mapper/jal-booking.mapper';
import { mapToJalSsoResponse } from './mapper/jal-sso.mapper';
import { JalSoapClient } from './jal-soap.client';

@Injectable()
export class JalService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jalSoapClient: JalSoapClient,
    @InjectPinoLogger(JalService.name)
    private readonly logger: PinoLogger,
  ) {}

  /** Builds the JAL SSO form payload by merging request data with config credentials */
  buildSsoPayload(request: JalSsoRequestDto): JalSsoResponseDto {
    this.logger.info(
      { userId: request.id, action: 'buildSsoPayload' },
      'Building SSO payload',
    );

    const config = {
      ssoUrl: this.configService.getOrThrow<string>('JAL_SSO_URL'),
      seamlessId: this.configService.getOrThrow<string>('JAL_SEAMLESS_ID'),
      accessCode: this.configService.getOrThrow<string>('JAL_ACCESS_CODE'),
      acudId: this.configService.getOrThrow<string>('JAL_ACUD_ID'),
      acudPassword: this.configService.getOrThrow<string>('JAL_ACUD_PASSWORD'),
    };

    const response = mapToJalSsoResponse(request, config);

    this.logger.info(
      {
        userId: request.id,
        targetUrl: response.targetUrl,
        action: 'buildSsoPayload',
      },
      'SSO payload built successfully',
    );

    return response;
  }

  /** Retrieves booking details from JAL via SOAP RetrieveProcedure (project number) */
  async retrieveBooking(
    request: JalRetrieveRequestDto,
  ): Promise<JalRetrieveResponseDto> {
    this.logger.info(
      { projectNumber: request.projectNumber, action: 'retrieveBooking' },
      'JAL retrieve booking requested',
    );

    const raw = await this.jalSoapClient.retrieveByProjectNumber(
      request.projectNumber,
    );
    const data = mapSoapToJalRetrieveResponse(raw, request.projectNumber);

    this.logger.info(
      {
        projectNumber: request.projectNumber,
        reservationCount: data.reservations.length,
        action: 'retrieveBooking',
      },
      'JAL retrieve booking completed',
    );

    return data;
  }
}
