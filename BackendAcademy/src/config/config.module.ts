import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().optional(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        JWT_SECRET: Joi.string().required().min(32).messages({
          'any.required': 'JWT_SECRET is required for production security. Use: openssl rand -hex 64',
          'string.min': 'JWT_SECRET must be at least 32 characters long for adequate security',
        }),
        JWT_REFRESH_SECRET: Joi.string().optional().min(32).messages({
          'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters long. Use a different value from JWT_SECRET.',
        }),
        API_KEY_SECRET: Joi.string().optional().min(32).messages({
          'string.min': 'API_KEY_SECRET must be at least 32 characters long for production use.',
        }),
        AI_PROVIDER: Joi.string().valid('claude', 'openai', 'mock').default('mock'),
        ANTHROPIC_API_KEY: Joi.string().optional(),
        OPENAI_API_KEY: Joi.string().optional(),
        AI_MODEL: Joi.string().optional(),
        AI_MAX_TOKENS: Joi.number().default(4096),
        AI_TEMPERATURE: Joi.number().default(0.7),

        // Static / uploaded asset support
        ASSETS_UPLOAD_DIR: Joi.string().optional(),
        ASSETS_MAX_SIZE_MB: Joi.number().optional(),
        ASSETS_BASE_URL: Joi.string().optional(),
        ASSETS_STATIC_DIR: Joi.string().optional(),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
