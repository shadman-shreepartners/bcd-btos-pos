import { Module } from '@nestjs/common';
import { JalController } from './jal.controller';
import { JalService } from './jal.service';

@Module({
  controllers: [JalController],
  providers: [JalService],
})
export class JalModule {}
