import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnaController } from './ana.controller';
import { AnaService } from './ana.service';

@Module({
  imports: [ConfigModule],
  controllers: [AnaController],
  providers: [AnaService],
})
export class AnaModule {}
