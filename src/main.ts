import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createCorsConfig } from './config/cors.config';
import { setupHelmetAndCompression } from './config/helmet-compression.config';
import { validationPipeOptions } from './config/validation.config';
import { setupRequestSizeLimit } from './config/request-size.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  setupRequestSizeLimit(app, configService);
  setupHelmetAndCompression(app);
  app.enableCors(createCorsConfig(configService));
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  await app.listen(parseInt(configService.get('PORT', '3000')));
}
bootstrap();
