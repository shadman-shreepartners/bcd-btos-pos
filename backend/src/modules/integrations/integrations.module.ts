import { Module } from '@nestjs/common';
import { JalModule } from './jal/jal.module';

@Module({
  imports: [JalModule],
})
export class IntegrationsModule {}
