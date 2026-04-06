import { Body, Controller, Post } from '@nestjs/common';
import { JalService } from './jal.service';
import { JalSsoRequestDto } from './dto/jal-sso-request.dto';
import { JalSsoResponseDto } from './dto/jal-sso-response.dto';

@Controller('integrations/jal')
export class JalController {
  constructor(private readonly jalService: JalService) {}

  @Post('sso')
  buildSsoForm(@Body() request: JalSsoRequestDto): JalSsoResponseDto {
    return this.jalService.buildSsoPayload(request);
  }
}
