import { Body, Controller, Post } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  ResponseHelper,
  SuccessResponse,
} from '../../../common/interfaces/response';
import { AnaService } from './ana.service';
import { AnaSsoRequestDto } from './dto/ana-sso-request.dto';
import { AnaSsoResponseDto } from './dto/ana-sso-response.dto';
import { ANA_SSO_SUCCESS_MESSAGE } from './constants/ana.constants';

@Controller('integrations/ana')
export class AnaController {
  constructor(
    private readonly anaService: AnaService,
    @InjectPinoLogger(AnaController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('sso')
  buildSsoForm(
    @Body() request: AnaSsoRequestDto,
  ): SuccessResponse<AnaSsoResponseDto> {
    this.logger.info(
      { companyId: request.companyId, employeeId: request.employeeId },
      'ANA SSO request received',
    );

    return ResponseHelper.success(
      this.anaService.buildSsoPayload(request),
      ANA_SSO_SUCCESS_MESSAGE,
    );
  }
}
