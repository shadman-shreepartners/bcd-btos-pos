import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AnaSsoRequestDto } from './dto/ana-sso-request.dto';
import { AnaSsoResponseDto } from './dto/ana-sso-response.dto';
import { mapToAnaSsoResponse } from './mapper/ana-sso.mapper';
import { AnaCredentialRecord } from './types/ana.types';
import { generateProjectNumber } from '../jal/utils/jal-project-number';
import { SUPPLIER_KIND } from '../jal/constants/jal.constants';

@Injectable()
export class AnaService {
  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(AnaService.name)
    private readonly logger: PinoLogger,
  ) {}

  buildSsoPayload(request: AnaSsoRequestDto): AnaSsoResponseDto {
    this.logger.info(
      { companyId: request.companyId, employeeId: request.employeeId },
      'Building ANA SSO payload',
    );

    const credential = this.resolveCredential(
      request.companyId,
      request.employeeId,
    );

    const projectNumber = generateProjectNumber(
      request.corpId,
      SUPPLIER_KIND.ANA,
    );

    this.logger.info(
      { corpId: request.corpId, projectNumber },
      'Generated ANA project number',
    );

    const response = mapToAnaSsoResponse(
      request,
      credential,
      {
        ssoUrl: this.configService.getOrThrow<string>('ANA_SSO_URL'),
        sendDataUrl: this.configService.getOrThrow<string>('ANA_SEND_DATA_URL'),
      },
      projectNumber,
    );

    this.logger.info(
      { companyId: request.companyId, employeeId: request.employeeId },
      'ANA SSO payload built successfully',
    );

    return response;
  }

  private resolveCredential(
    companyId: string,
    employeeId: string,
  ): AnaCredentialRecord {
    const credentials = this.configService.getOrThrow<AnaCredentialRecord[]>(
      'ANA_SSO_CREDENTIALS',
    );

    const matched = credentials.find(
      (entry) =>
        entry.companyId === companyId && entry.employeeId === employeeId,
    );

    if (!matched) {
      throw new NotFoundException('Company credentials not found');
    }

    return matched;
  }
}
