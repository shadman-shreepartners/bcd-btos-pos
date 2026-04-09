import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SoapModule } from 'nestjs-soap';
import { JAL_SOAP_CLIENT } from './constants/jal-soap.constants';
import { JalController } from './jal.controller';
import { JalService } from './jal.service';
import { JalSoapClient } from './jal-soap.client';

@Module({
  imports: [
    SoapModule.forRootAsync({
      clientName: JAL_SOAP_CLIENT,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.getOrThrow<string>('JAL_SOAP_WSDL_URL');
        const user = config.get<string>('JAL_SOAP_BASIC_USER');
        const password = config.get<string>('JAL_SOAP_BASIC_PASSWORD');
        const auth =
          user && password
            ? {
                type: 'basic' as const,
                username: user,
                password,
              }
            : undefined;

        return {
          uri,
          auth,
        };
      },
    }),
  ],
  controllers: [JalController],
  providers: [JalService, JalSoapClient],
})
export class JalModule {}
