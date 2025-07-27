import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createCorsConfig } from './config/cors.config';
import { setupHelmetAndCompression } from './config/helmet-compression.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  setupHelmetAndCompression(app);
  app.enableCors(createCorsConfig(configService));

  await app.listen(parseInt(configService.get('PORT', '3000')));
}
bootstrap();
