import { Body, Controller, Post } from '@nestjs/common';
import { EkispertSearchRequestDto } from './dto/ekispert-search.request.dto';
import { EkispertService } from './ekispert.service';

@Controller('integrations/ekispert')
export class EkispertController {
  constructor(private readonly ekispertService: EkispertService) {}

  @Post('search')
  search(
    @Body() request: EkispertSearchRequestDto,
  ): ReturnType<EkispertService['search']> {
    return this.ekispertService.search(request);
  }
}
