import { Module } from '@nestjs/common';
import { JalModule } from './jal/jal.module';
import { EkispertModule } from './ekispert/ekispert.module';
import { AnaModule } from './ana/ana.module';

@Module({
  imports: [JalModule, EkispertModule, AnaModule],
})
export class IntegrationsModule {}
