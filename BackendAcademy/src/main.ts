import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    }),
  );

  // Strict transport security
  app.use(
    helmet.hsts({
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
    }),
  );

  // Prevent MIME type sniffing
  app.use(helmet.noSniff());

  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Stellar Basic DAO API')
    .setDescription('The Stellar Basic DAO Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Serve read-only, prebuilt static assets from `ASSETS_STATIC_DIR`
  // (default: `./public`) at the URL prefix `/static`. The directory is
  // created on demand if missing so the backend can boot in a fresh
  // clone without crashing.
  const staticDir = path.resolve(
    process.env.ASSETS_STATIC_DIR ?? './public',
  );
  try {
    fs.mkdirSync(staticDir, { recursive: true });
    app.useStaticAssets(staticDir, { prefix: '/static/' });
    logger.log(`Static assets served from ${staticDir} at /static/`);
  } catch (err) {
    logger.warn(
      `Failed to mount static asset directory ${staticDir}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
