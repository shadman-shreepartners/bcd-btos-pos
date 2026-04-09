import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  const port = app.get(ConfigService).getOrThrow<number>('PORT');

  await app.listen(port);
}

void bootstrap().catch((error) => {
  console.error('Application bootstrap failed', error);
  process.exit(1);
});
