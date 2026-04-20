import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfig } from './config/env.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService<AppConfig, true>);
  const logger = new Logger('Bootstrap');

  const port = config.get('port', { infer: true });
  const globalPrefix = config.get('apiGlobalPrefix', { infer: true });
  const apiVersion = config.get('apiVersion', { infer: true });
  const webOrigin = config.get('webOrigin', { infer: true });
  const sessionSecret = config.get('sessionSecret', { infer: true });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser(sessionSecret));

  app.enableCors({
    origin: webOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion.replace(/^v/, ''),
  });

  // Global ValidationPipe validates class-validator DTOs (e.g. SignupDto,
  // LoginDto) and performs type coercion for route params/queries. Zod-typed
  // bodies reflect as `Object` at runtime, so Nest's `toValidate()` skips
  // them here; they are validated by `ZodValidationPipe` at the route level.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/${globalPrefix}/${apiVersion}`);
}

void bootstrap();
