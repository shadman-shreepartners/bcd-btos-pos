import { Body, Controller, Post } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JalService } from './jal.service';
import { JalRetrieveRequestDto } from './dto/jal-retrieve-request.dto';
import { JalRetrieveResponseDto } from './dto/jal-retrieve-response.dto';
import { JalSsoRequestDto } from './dto/jal-sso-request.dto';
import { JalSsoResponseDto } from './dto/jal-sso-response.dto';
import {
  ResponseHelper,
  SuccessResponse,
} from '../../../common/interfaces/response';

@Controller('integrations/jal')
export class JalController {
  constructor(
    private readonly jalService: JalService,
    @InjectPinoLogger(JalController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('sso')
  buildSsoForm(@Body() request: JalSsoRequestDto): JalSsoResponseDto {
    this.logger.info({ userId: request.id }, 'JAL SSO request received');
    return this.jalService.buildSsoPayload(request);
  }

  @Post('retrieve')
  async retrieveBooking(
    @Body() request: JalRetrieveRequestDto,
  ): Promise<SuccessResponse<JalRetrieveResponseDto>> {
    this.logger.info(
      { projectNumber: request.projectNumber },
      'JAL retrieve request received',
    );
    const data = await this.jalService.retrieveBooking(request);
    return ResponseHelper.success(
      data,
      'Successfully retrieved JAL reservation',
    );
  }
}
