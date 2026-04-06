import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JalSsoRequestDto } from './dto/jal-sso-request.dto';
import { JalSsoResponseDto } from './dto/jal-sso-response.dto';
import { mapToJalSsoResponse } from './mapper/jal-sso.mapper';

@Injectable()
export class JalService {
  constructor(private readonly configService: ConfigService) {}

  /** Builds the JAL SSO form payload by merging request data with config credentials */
  buildSsoPayload(request: JalSsoRequestDto): JalSsoResponseDto {
    const config = {
      ssoUrl: this.configService.getOrThrow<string>('JAL_SSO_URL'),
      seamlessId: this.configService.getOrThrow<string>('JAL_SEAMLESS_ID'),
      accessCode: this.configService.getOrThrow<string>('JAL_ACCESS_CODE'),
      acudId: this.configService.getOrThrow<string>('JAL_ACUD_ID'),
      acudPassword: this.configService.getOrThrow<string>('JAL_ACUD_PASSWORD'),
    };

    return mapToJalSsoResponse(request, config);
  }
}
