import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
  console.log(`Application is running on url: ${await app.getUrl()}`);
}
bootstrap();
