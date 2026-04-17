import { Module } from '@nestjs/common';
import { EkispertController } from './ekispert.controller';
import { EkispertService } from './ekispert.service';

@Module({
  controllers: [EkispertController],
  providers: [EkispertService],
})
export class EkispertModule {}
