import { Body, Controller, Post } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JalService } from './jal.service';
import { JalRetrieveRequestDto } from './dto/jal-retrieve-request.dto';
import { JalRetrieveResponseDto } from './dto/jal-retrieve-response.dto';
import { JalSsoRequestDto } from './dto/jal-sso-request.dto';
import { JalSsoResponseDto } from './dto/jal-sso-response.dto';

@Controller('integrations/jal')
export class JalController {
  constructor(
    private readonly jalService: JalService,
    @InjectPinoLogger(JalController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('sso')
  buildSsoForm(@Body() request: JalSsoRequestDto): JalSsoResponseDto {
    this.logger.info(
      { userId: request.id, action: 'buildSsoForm' },
      'JAL SSO request received',
    );
    return this.jalService.buildSsoPayload(request);
  }

  @Post('retrieve')
  async retrieveBooking(
    @Body() request: JalRetrieveRequestDto,
  ): Promise<JalRetrieveResponseDto> {
    this.logger.info(
      { projectNumber: request.projectNumber, action: 'retrieveBooking' },
      'JAL retrieve request received',
    );
    return this.jalService.retrieveBooking(request);
  }
}
