import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { ResponseInterceptor } from './infrastructure/http/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './infrastructure/http/filters/exception.filter';

async function bootstrap() {
  const env = loadEnv();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS
  app.enableCors({
    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(','),
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors & filters
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger (non-production)
  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API CQRS Sankhya')
      .setDescription('Read-only CQRS API for Sankhya ERP')
      .setVersion('0.1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Api-Key', in: 'header' }, 'api-key')
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, doc);
  }

  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`API CQRS Sankhya running on http://localhost:${env.PORT}`);
  if (env.NODE_ENV !== 'production') {
    logger.log(`Swagger: http://localhost:${env.PORT}/docs`);
  }
}

bootstrap();
